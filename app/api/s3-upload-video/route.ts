import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { videoBuffer, fileName } = await request.json();
    
    const key = `videos/${uuidv4()}-${fileName}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: Buffer.from(videoBuffer),
        ContentType: "video/mp4",
      })
    );

    const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return Response.json({ success: true, videoUrl });
  } catch (error) {
    console.error("Error uploading video to S3:", error);
    return Response.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
