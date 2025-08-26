'use server';
/**
 * @fileOverview A simple AI chat flow for answering questions about trust check results.
 */

import {ai} from '@/ai/genkit';
import type {ChatMessage} from '@/lib/types';

/**
 * A simple wrapper around the ai.generate call to handle chat conversations.
 * @param history A history of the chat messages.
 * @param userMessage The user's message.
 * @returns The AI's response to the user's message.
 */
export async function chatWithResults(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  // The ai.generate function expects an array of messages with a specific structure.
  // We need to ensure our history matches this structure.
  const messages = history.map(msg => ({
    role: msg.role,
    // The content must be an array of 'Part' objects.
    content: msg.parts.map(part => ({text: part.text})),
  }));

  // Add the new user message to the history for this call.
  messages.push({
    role: 'user',
    content: [{text: userMessage}],
  });

  try {
    const response = await ai.generate({
      messages: messages,
    });

    const text = response.text;
    if (!text) {
      return "I'm sorry, I couldn't generate a valid response. Please try again.";
    }
    return text;
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    console.error('Error in chatWithResults flow:', e);
    return `Sorry, an error occurred: ${error}`;
  }
}
