'use server';
/**
 * @fileOverview Enables a chat conversation about TrustCheck analysis results.
 *
 * - chatWithResults - A function to handle chat messages regarding the analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema is defined here but not exported
const ChatWithResultsInputSchema = z.object({
  analysisData: z
    .string()
    .describe('A pre-formatted string containing all the analysis results.'),
  userMessage: z.string().describe("The user's message or question."),
});

// Define types based on the schema for internal use
export type ChatWithResultsInput = z.infer<typeof ChatWithResultsInputSchema>;
export type ChatWithResultsOutput = string;

/**
 * The main exported function for the chat flow.
 * @param input The structured input data for the chat.
 * @returns A string containing the AI's response.
 */
export async function chatWithResults(
  input: ChatWithResultsInput
): Promise<ChatWithResultsOutput> {
  // Directly call the AI with a simple, clear prompt.
  const {output} = await ai.generate({
    prompt: `You are an AI assistant for the TrustCheck application.
Your task is to answer user questions based on the security analysis report for an email or domain.
Please use ONLY the information provided in the report to answer the user's question.
If the information is not in the report, state that you do not have that information.

Here is the full analysis report:
---
${input.analysisData}
---

Here is the user's question:
"${input.userMessage}"

Your answer:`,
  });

  const response = output as string | null;

  // Handle cases where the model might return a null or empty response
  if (response === null || response === undefined || response.trim() === '') {
    return "I'm sorry, I wasn't able to generate a response for that. Please try rephrasing your question.";
  }
  return response;
}
