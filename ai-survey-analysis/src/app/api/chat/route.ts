import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * API route handler for POST requests
 * Analyzes open-ended survey responses using GPT-4
 * @param {Request} req - The incoming request object
 * @returns {Response} A streaming response with the analysis
 */
export async function POST(req: Request) {
  // Extract the prompt from the request body
  const { prompt } = await req.json();

  // Define the system message for GPT-4
  const systemMessage = `You are a helpful assistant analyzing open-ended questions from survey responses.
  
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

    Ensure there's a blank line between each question's analysis.`;

  // Stream the text from GPT-4
  const { textStream } = await streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ],
  });

  // Create a ReadableStream from the textStream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const textPart of textStream) {
          controller.enqueue(new TextEncoder().encode(textPart));
        }
      } catch (error) {
        console.error('Error in stream processing:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  // Return a streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}