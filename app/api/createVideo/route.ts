import RunwayML from '@runwayml/sdk';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function POST(request: Request) {
  const { menuUrl } = await request.json();

  if (!menuUrl) {
    throw new Error("No menu URL provided");
  }

  console.log({ menuUrl });

  const menuItems = [
    { name: "Pasta", description: "Creamy Alfredo pasta", imageUrl: "https://example.com/pasta.jpg" },
    { name: "Burger", description: "Juicy beef burger with lettuce and cheese", imageUrl: "https://example.com/burger.jpg" },
  ]; // Example: You would extract this data from your menuUrl using OCR or other parsing logic.

  console.log("Processing menu items...");

  const animationPromises = menuItems.map(async (item) => {
    console.log("Generating animation for:", item.name);

    try {
      const imageToVideo = await client.imageToVideo.create({
        model: 'gen3a_turbo',
        promptImage: item.imageUrl,
        promptText: `Create an animated sequence of ${item.name}, described as ${item.description}.`,
      });

      const taskId = imageToVideo.id;

      let task;
      do {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for ten seconds
        task = await client.tasks.retrieve(taskId);
      } while (!['SUCCEEDED', 'FAILED'].includes(task.status));

      if (task.status === 'SUCCEEDED') {
        console.log(`Animation for ${item.name} completed:`, task.result);
        item.animationUrl = task.result; // Add the generated animation URL to the item

        // Upload animation to S3
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: `${item.name}.mp4`,
          Body: Buffer.from(task.result),
          ContentType: 'video/mp4',
        }));
      } else {
        console.error(`Failed to generate animation for ${item.name}`);
      }
    } catch (error) {
      console.error(`Error processing ${item.name}:`, error);
    }

    return item;
  });

  const results = await Promise.all(animationPromises);
  return results;
}
