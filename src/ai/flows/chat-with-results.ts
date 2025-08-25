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
  prompt: `You are an AI assistant for the TrustCheck application. Your task is to answer user questions based on the security analysis report for an email or domain.

I will provide you with the full analysis report. Please use ONLY this information to answer the user's question.

- Summarize the key findings in clear, simple language.
- Explain what the results mean in terms of trustworthiness or risk.
- Base your response only on the information provided in the report. If the information is not in the report, state that you do not have that information.

Here is the full analysis report:
---
{{{analysisData}}}
---

Here is the user's question:
"{{{userMessage}}}"

Your answer:
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
    if (output === null || output === undefined || output.trim() === '') {
      return "I'm sorry, I wasn't able to generate a response for that. Please try rephrasing your question.";
    }
    return output;
  }
);
