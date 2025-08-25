'use server';
/**
 * @fileOverview Enables a chat conversation about TrustCheck analysis results.
 *
 * - chatWithResults - A function to handle chat messages regarding the analysis.
 */
import {ai} from '@/ai/genkit';
import {Message} from 'genkit';

export async function chatWithResults(
  history: Message[],
  userMessage: string
): Promise<string> {
  try {
    // The correct way to handle conversation with a stateless model is to provide the full history.
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      history: history,
      prompt: userMessage,
    });

    const text = output.text;

    if (!text) {
      return "I'm sorry, I wasn't able to generate a response for that. Please try rephrasing your question.";
    }
    return text;
  } catch (e) {
    console.error('Error in chatWithResults flow:', e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unexpected error occurred.';
    return `Sorry, an error occurred: ${errorMessage}`;
  }
}
