---
name: cloudflare-r2
description: Cloudflare R2 storage patterns for this project. Load before writing any R2 upload/download code.
---

# Cloudflare R2 — Working Patterns for This Project

Before writing any new R2 code, fetch the official docs:
https://developers.cloudflare.com/llms.txt

Then read the R2 section. After that, reuse the patterns below — they are tested and working in production.

---

## Key files (read these before touching storage code)

| File | Purpose |
|---|---|
| `src/lib/r2-storage.ts` | Server-side S3 client + presigned URL generators |
| `src/lib/patient-file-storage.ts` | Client-side upload/download helpers + Supabase fallback |
| `src/app/api/storage/upload-url/route.ts` | POST endpoint — returns presigned PUT URL |
| `src/app/api/storage/signed-url/route.ts` | GET endpoint — returns presigned GET URL |
| `src/hooks/use-images.ts` | React hook — upload with R2 first, Supabase fallback |

---

## Server-side S3 client (R2-specific config)

```typescript
// src/lib/r2-storage.ts
import { S3Client } from '@aws-sdk/client-s3'

new S3Client({
  region: 'auto',                    // ← ALWAYS 'auto' for R2, never 'us-east-1' etc.
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
})
```

**Common mistakes:**
- Using a real region name → request fails silently or with auth error
- Forgetting the endpoint → SDK hits AWS instead of R2
- Passing `ACL` to PutObjectCommand → R2 does not support ACLs, throws error

---

## Upload flow (presigned PUT — 3 steps)

R2 credentials must stay server-side. The browser never touches them.

**Step 1 — Browser asks server for a presigned URL:**
```typescript
// Client-side (src/lib/patient-file-storage.ts → uploadToR2)
const res = await fetch('/api/storage/upload-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
})
const { uploadUrl } = await res.json()
```

**Step 2 — Server generates presigned URL (10 min expiry):**
```typescript
// Server-side (src/lib/r2-storage.ts → createR2UploadUrl)
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const command = new PutObjectCommand({ Bucket, Key: key, ContentType: contentType })
return getSignedUrl(client, command, { expiresIn: 600 })
```

**Step 3 — Browser PUTs file directly to R2:**
```typescript
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type || 'application/octet-stream' },
  body: file,
})
```

**What to store in the database:** the plain storage key (e.g. `clinicId/patientId/xray/uuid.jpg`), NOT a full URL.

---

## Download flow (presigned GET or public URL)

```typescript
// src/lib/r2-storage.ts → createR2SignedUrl
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
if (publicUrl) {
  return `${publicUrl.replace(/\/$/, '')}/${key}`   // public bucket — no signing needed
}
// Private bucket — sign for 24 hours
const command = new GetObjectCommand({ Bucket, Key: key })
return getSignedUrl(client, command, { expiresIn: 86400 })
```

**Client-side resolution:**
```typescript
// src/lib/patient-file-storage.ts → resolveR2FileUrl
const res = await fetch(`/api/storage/signed-url?key=${encodeURIComponent(key)}`)
const { signedUrl } = await res.json()
```

---

## Key validation (security — both API routes use this)

```typescript
// Prevents path traversal attacks
if (!/^[\w\-./]+$/.test(key)) {
  return NextResponse.json({ error: 'Invalid key format' }, { status: 400 })
}
```

---

## Storage path format

```
{clinicId}/{patientId}/{category}/{uuid}.{ext}
```

Built by `buildPatientFileStoragePath()` in `src/lib/patient-file-storage.ts`.

---

## Detecting R2 vs Supabase stored files

Files stored in R2 have a plain path (no `https://` prefix).
Files stored in Supabase have a full URL starting with `https://`.

```typescript
const isR2Key = !fileUrlOrPath.startsWith('http')
```

The app handles both automatically — do not break this detection when editing storage code.

---

## Environment variables

```bash
CLOUDFLARE_R2_ACCOUNT_ID          # Found in Cloudflare dashboard → R2
CLOUDFLARE_R2_ACCESS_KEY_ID       # R2 API Token → Access Key ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY   # R2 API Token → Secret Access Key
CLOUDFLARE_R2_BUCKET_NAME         # Your bucket name
CLOUDFLARE_R2_PUBLIC_URL          # Optional: https://your-custom-domain.com
```

---

## Packages (already installed)

```json
"@aws-sdk/client-s3": "...",
"@aws-sdk/s3-request-presigner": "..."
```

Do NOT install `aws-sdk` (v2) — only the v3 modular packages above are used.
