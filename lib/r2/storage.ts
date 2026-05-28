import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const R2_BUCKET = "see-you-wild-images";
const R2_PUBLIC_URL = "https://pub-4f074e0ebf814197a45996298c88925f.r2.dev";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadEventImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const ext = filename.split(".").pop() ?? "jpg";
  const key = `events/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}
