'use server';
/**
 * @fileOverview A simple AI chat flow for answering questions about trust check results.
 */

import {ai} from '@/ai/genkit';
import type {ChatMessage} from '@/lib/types';

export async function chatWithResults(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  // Add the new user message to the history
  const fullHistory: ChatMessage[] = [
    ...history,
    {role: 'user', parts: [{text: userMessage}]},
  ];

  try {
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      history: fullHistory,
      prompt: userMessage, 
    });

    // It's crucial to check if output exists and has a text property.
    if (output && typeof output.text === 'string') {
      return output.text;
    } else {
      // Handle cases where the model returns no valid text response
      const responseText = output?.text ?? 'No text property in response';
      console.warn('AI did not return a valid text response:', responseText);
      return "I'm sorry, I couldn't generate a valid response. Please try again.";
    }
  } catch (e) {
    console.error('Error in chatWithResults flow:', e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unexpected error occurred.';
    // Return a user-friendly error message
    return `Sorry, an error occurred: ${errorMessage}`;
  }
}
