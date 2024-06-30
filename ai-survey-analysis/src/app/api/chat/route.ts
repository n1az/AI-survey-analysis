import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { textStream } = await streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant analyzing open-ended questions from survey responses.
      
            For each open-ended response, provide the following analysis:
            1. Summary: A short summary of the answer relative to question.
            2. Sentiment analysis: "Positive", "Neutral" or "Negative"
            3. Topic Category: Categorize the open-ended answer into a main topic. e.g. "Work Environment complaints" based on both question and answer
            4. Action recommendation: One-sentence suggestion to solve the problem mentioned or improve the situation/effect in the answer.

            Format your response as follows for each question:
            [Question Key]
            Question: [Actual Question from the survey]
            Summary: [Summary]
            Sentiment analysis: [Sentiment]
            Topic Category: [Category]
            Action recommendation: [Recommendation]

            Ensure there's a blank line between each question's analysis.`
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