'use server';
/**
 * @fileOverview Enables a chat conversation about TrustCheck analysis results.
 *
 * - chatWithResults - A function to handle chat messages regarding the analysis.
 * - ChatWithResultsInput - The input type for the chatWithResults function.
 * - ChatWithResultsOutput - The return type for the chatWithResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { TrustCheckResult } from '@/lib/types';

const ChatWithResultsInputSchema = z.object({
  analysisResults: z.any().describe('The full TrustCheck analysis result object.'),
  userMessage: z.string().describe('The user\'s message or question.'),
});
export type ChatWithResultsInput = z.infer<typeof ChatWithResultsInputSchema>;

export type ChatWithResultsOutput = string;

export async function chatWithResults(
  input: ChatWithResultsInput
): Promise<ChatWithResultsOutput> {
  return chatWithResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithResultsPrompt',
  input: {schema: ChatWithResultsInputSchema},
  output: {schema: z.string()},
  prompt: `You are a helpful AI assistant embedded in the FakeOrNot application. Your role is to answer user questions about the analysis results they have just received.

  You have access to the full JSON object of the analysis results. Use this data to provide clear, concise, and easy-to-understand explanations. Do not make up information. If the answer isn't in the provided data, say that you don't have that information.

  Analysis Results:
  \`\`\`json
  {{{json analysisResults}}}
  \`\`\`

  User's Question:
  "{{{userMessage}}}"

  Your Answer:
`,
});

const chatWithResultsFlow = ai.defineFlow(
  {
    name: 'chatWithResultsFlow',
    inputSchema: ChatWithResultsInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
