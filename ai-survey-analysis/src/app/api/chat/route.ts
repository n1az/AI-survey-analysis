import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  console.log("Received prompt:", prompt);

  const { textStream } = await streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant analyzing open-ended questions from survey responses."
      },
      {
        role: "user",
        content: prompt
      }
    ],
  });

  // Create a ReadableStream from the textStream
  const stream = new ReadableStream({
    async start(controller) {
      for await (const textPart of textStream) {
        controller.enqueue(new TextEncoder().encode(textPart));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}