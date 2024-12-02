import OpenAI from 'openai';
import { Readable } from 'stream';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDescription(name: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional food critic and menu writer. Provide detailed, appetizing descriptions of dishes in about 50 words."
      },
      {
        role: "user",
        content: `Write an appetizing description for this dish: ${name}`
      }
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content || '';
}

export async function generateSpeech(text: string): Promise<Buffer> {
  const mp3Response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await mp3Response.arrayBuffer());
  return buffer;
} 