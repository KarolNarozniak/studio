'use server';
/**
 * @fileOverview Enables a chat conversation about TrustCheck analysis results.
 *
 * - chatWithResults - A function to handle chat messages regarding the analysis.
 */

import { ai } from '@/ai/genkit';
import { Message } from 'genkit';

export async function chatWithResults(input: {
  analysisData: string;
  userMessage: string;
}): Promise<string> {
  const systemPrompt = `You are an AI assistant for the TrustCheck application.
Your task is to answer user questions based on the security analysis report for an email or domain.
Please use ONLY the information provided in the report to answer the user's question.
If the information is not in the report, state that you do not have that information.

Here is the full analysis report:
---
${input.analysisData}
---
`;

  const history: Message[] = [
    {
      role: 'system',
      content: [{ text: systemPrompt }],
    },
  ];

  const { output } = await ai.generate({
    history: history,
    prompt: input.userMessage,
  });

  const responseText = output() as string | null;

  if (responseText === null || responseText.trim() === '') {
    return "I'm sorry, I wasn't able to generate a response for that. Please try rephrasing your question.";
  }
  return responseText;
}
