import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Cloudflare R2 environment variables are not configured')
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

function getBucket(): string {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME
  if (!bucket) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not set')
  return bucket
}

/** Generate a presigned URL for a client to PUT a file directly to R2. Valid for 10 minutes. */
export async function createR2UploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const client = getR2Client()
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(client, command, { expiresIn: 600 })
}

/** Generate a presigned URL to GET (view) a file from R2. Valid for 24 hours. */
export async function createR2SignedUrl(key: string): Promise<string> {
  // If the bucket has a public domain set, use it directly (no signing needed)
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, '')}/${key}`
  }

  const client = getR2Client()
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key })
  return getSignedUrl(client, command, { expiresIn: 86400 })
}

/** Delete a file from R2. */
export async function deleteR2Object(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }))
}

/** Returns true if R2 is configured, false if Supabase Storage should be used. */
export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME
  )
}
