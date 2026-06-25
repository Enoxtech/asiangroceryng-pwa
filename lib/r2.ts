import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

function getClient(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)');
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error('R2_BUCKET_NAME is not configured');
  return bucket;
}

function getPublicUrl(): string {
  const url = process.env.R2_PUBLIC_URL;
  if (!url) throw new Error('R2_PUBLIC_URL is not configured');
  return url.replace(/\/$/, '');
}

/** Uploads a file to the R2 bucket and returns its public URL. */
export async function uploadToR2(key: string, body: Buffer, contentType?: string): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${getPublicUrl()}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}
