<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Cloudflare R2 Storage

## Before writing ANY Cloudflare R2 code
1. Fetch https://developers.cloudflare.com/llms.txt and read the R2 section
2. Read the existing working implementation — do NOT write R2 code from scratch:
   - `src/lib/r2-storage.ts` — server-side S3 client, presigned URL helpers
   - `src/lib/patient-file-storage.ts` — client-side upload/download helpers
   - `src/app/api/storage/upload-url/route.ts` — presigned PUT URL endpoint
   - `src/app/api/storage/signed-url/route.ts` — presigned GET URL endpoint

## Critical R2 differences from AWS S3 (common AI mistakes)
- `region` MUST be `'auto'` — never a real region name like `'us-east-1'`
- `endpoint` MUST be `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- R2 does NOT support S3 ACLs — do not pass `ACL` in any command
- Egress is free — no need to minimise downloads for cost reasons
- Use `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (already installed)

## Architecture: presigned URL pattern (3 steps)
R2 credentials are server-side only. Never expose them to the browser.

```
Upload:  Browser → POST /api/storage/upload-url → get presigned PUT URL
                 → PUT file directly to R2 using presigned URL

Download: Browser → GET /api/storage/signed-url?key= → get presigned GET URL
                  → fetch image using presigned URL
          OR: use CLOUDFLARE_R2_PUBLIC_URL/${key} if bucket has public domain
```

## Environment variables
```
CLOUDFLARE_R2_ACCOUNT_ID          # Cloudflare account ID
CLOUDFLARE_R2_ACCESS_KEY_ID       # R2 API token access key
CLOUDFLARE_R2_SECRET_ACCESS_KEY   # R2 API token secret key
CLOUDFLARE_R2_BUCKET_NAME         # Bucket name
CLOUDFLARE_R2_PUBLIC_URL          # Optional: custom public domain for bucket
```

## Fallback behaviour
If R2 env vars are absent, the app falls back to Supabase Storage automatically.
See `src/hooks/use-images.ts` — do not break this fallback when modifying upload code.
<!-- END:nextjs-agent-rules -->
