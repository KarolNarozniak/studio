'use server';
/**
 * @fileOverview Detects potential typosquatting attacks based on a domain name.
 *
 * - detectTyposquatting - A function that analyzes a domain for typosquatting risk.
 * - DetectTyposquattingInput - The input type for the detectTyposquatting function.
 * - DetectTyposquattingOutput - The return type for the detectTyposquatting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTyposquattingInputSchema = z.object({
  domain: z.string().describe('The domain name to analyze for typosquatting.'),
});
export type DetectTyposquattingInput = z.infer<typeof DetectTyposquattingInputSchema>;

const DetectTyposquattingOutputSchema = z.object({
  isPotentialTyposquatting: z.boolean().describe('Whether the domain is suspected of being a typosquatting attempt.'),
  suspectedOriginalDomain: z.string().describe('The well-known domain it might be imitating (e.g., "google.com"). Provide "N/A" if no specific domain is suspected.'),
  reason: z.string().describe('A brief explanation of why the domain is or is not considered a typosquatting risk.'),
});
export type DetectTyposquattingOutput = z.infer<typeof DetectTyposquattingOutputSchema>;

export async function detectTyposquatting(
  input: DetectTyposquattingInput
): Promise<DetectTyposquattingOutput> {
  return detectTyposquattingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectTyposquattingPrompt',
  input: {schema: DetectTyposquattingInputSchema},
  output: {schema: DetectTyposquattingOutputSchema},
  prompt: `You are a cybersecurity analyst specializing in identifying typosquatting and phishing attempts. Your task is to analyze the given domain name and determine if it's a likely attempt to impersonate a well-known brand or website.

  Domain to analyze: {{{domain}}}

  Consider the following:
  - Common misspellings (e.g., "gogle.com" instead of "google.com").
  - Different top-level domains (e.g., "netflix.co" instead of "netflix.com").
  - Homoglyph attacks (using similar-looking characters).
  - Addition of plausible-sounding words (e.g., "netflix-login.com").
  - The reputation and commonality of the suspected original domain. A domain like "nedflix.com" is almost certainly a scam targeting "netflix.com". A domain like "mycoolsite.com" is likely not a typosquatting attempt.

  Based on your analysis, provide a structured response. If it is a likely typosquatting attempt, identify the original domain being targeted.
`,
});

const detectTyposquattingFlow = ai.defineFlow(
  {
    name: 'detectTyposquattingFlow',
    inputSchema: DetectTyposquattingInputSchema,
    outputSchema: DetectTyposquattingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
