'use server';
/**
 * @fileOverview Enables a chat conversation about TrustCheck analysis results.
 *
 * - chatWithResults - A function to handle chat messages regarding the analysis.
 */
import { Message } from 'genkit';
import { geminiFlash } from '@/ai/genkit';

export async function chatWithResults(
  history: Message[],
  userMessage: string
): Promise<string> {
  try {
    const chat = geminiFlash.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

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
