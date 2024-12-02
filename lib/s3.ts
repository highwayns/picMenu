import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `audio/${uuidv4()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
} 