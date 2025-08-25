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

const ChatWithResultsInputSchema = z.object({
  analysisData: z
    .string()
    .describe('A pre-formatted string containing all the analysis results.'),
  userMessage: z.string().describe("The user's message or question."),
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
  output: {schema: z.string().nullable()},
  prompt: `You are a helpful AI assistant embedded in the FakeOrNot application. Your role is to answer user questions based on the provided analysis report.

Do not make up information. If the answer isn't in the provided data, say that you don't have that information. Keep your answers concise and easy to understand.

## Analysis Report
{{{analysisData}}}
## End of Report

## User's Question
"{{{userMessage}}}"

## Your Answer
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
    // Handle cases where the model might return a null or empty response
    if (output === null || output === undefined) {
      return "I'm sorry, I wasn't able to generate a response for that. Please try rephrasing your question.";
    }
    return output;
  }
);
