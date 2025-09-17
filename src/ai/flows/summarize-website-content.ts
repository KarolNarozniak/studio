
'use server';
/**
 * @fileOverview Summarizes website content.
 *
 * - summarizeWebsiteContent - A function that summarizes the website content.
 * - SummarizeWebsiteContentInput - The input type for the summarizeWebsiteContent function.
 * - SummarizeWebsiteContentOutput - The return type for the summarizeWebsiteContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWebsiteContentInputSchema = z.object({
    websiteContent: z.string().describe('The full text content scraped from a website.'),
});
export type SummarizeWebsiteContentInput = z.infer<typeof SummarizeWebsiteContentInputSchema>;

const SummarizeWebsiteContentOutputSchema = z.object({
  summary: z.string().describe('A concise, two-sentence summary of what the website is about, in Polish.'),
});
export type SummarizeWebsiteContentOutput = z.infer<typeof SummarizeWebsiteContentOutputSchema>;

export async function summarizeWebsiteContent(
  input: SummarizeWebsiteContentInput
): Promise<SummarizeWebsiteContentOutput> {
  return summarizeWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWebsiteContentPrompt',
  input: { schema: SummarizeWebsiteContentInputSchema },
  output: { schema: SummarizeWebsiteContentOutputSchema },
  prompt: `
Jesteś asystentem AI. Twoim zadaniem jest przeczytanie poniższej treści strony internetowej i streszczenie jej w maksymalnie dwóch zdaniach, w języku polskim. Skup się na głównym celu lub temacie strony.

Treść strony:
---
{{{websiteContent}}}
---
`,
});

const summarizeWebsiteContentFlow = ai.defineFlow(
  {
    name: 'summarizeWebsiteContentFlow',
    inputSchema: SummarizeWebsiteContentInputSchema,
    outputSchema: SummarizeWebsiteContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
