'use server';
/**
 * @fileOverview Summarizes TrustCheck analysis results and provides a Fake/Real recommendation.
 *
 * - summarizeTrustCheckResults - A function that summarizes the analysis results.
 * - SummarizeTrustCheckResultsInput - The input type for the summarizeTrustCheckResults function.
 * - SummarizeTrustCheckResultsOutput - The return type for the summarizeTrustCheckResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTrustCheckResultsInputSchema = z.object({
  domainReputation: z.string().describe('Domain reputation information.'),
  whoisData: z.string().describe('WHOIS lookup data.'),
  dnsRecords: z.string().describe('DNS records information.'),
  blacklistStatus: z.string().describe('Blacklist status of the domain/email.'),
  threatIntelligence: z.string().describe('Threat intelligence report.'),
  historicalData: z.string().describe('Historical data of the domain.'),
  typosquattingCheck: z.string().describe('Analysis of whether the domain is a potential typosquatting attempt.'),
  emailVerification: z.string().optional().describe('Email verification details, if applicable.'),
});
export type SummarizeTrustCheckResultsInput = z.infer<typeof SummarizeTrustCheckResultsInputSchema>;

const SummarizeTrustCheckResultsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the analysis results.'),
  recommendation: z.enum(['Fake', 'Real']).describe('Recommendation based on the analysis.'),
  confidenceScore: z.number().describe('Confidence score for the recommendation (0-1).'),
});
export type SummarizeTrustCheckResultsOutput = z.infer<typeof SummarizeTrustCheckResultsOutputSchema>;

export async function summarizeTrustCheckResults(
  input: SummarizeTrustCheckResultsInput
): Promise<SummarizeTrustCheckResultsOutput> {
  return summarizeTrustCheckResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTrustCheckResultsPrompt',
  input: {schema: SummarizeTrustCheckResultsInputSchema},
  output: {schema: SummarizeTrustCheckResultsOutputSchema},
  prompt: `You are an AI chatbot designed to analyze domain/email check results and provide a risk assessment.

  Based on the following information, provide a summary of the findings and a recommendation of either "Fake" or "Real". Also provide a confidence score between 0 and 1.
  The typosquatting check is very important. If it indicates a potential typosquatting attempt, the recommendation should almost always be "Fake" with a high confidence score, regardless of other factors.

  Domain Reputation: {{{domainReputation}}}
  WHOIS Data: {{{whoisData}}}
  DNS Records: {{{dnsRecords}}}
  Blacklist Status: {{{blacklistStatus}}}
  Threat Intelligence: {{{threatIntelligence}}}
  Historical Data: {{{historicalData}}}
  Typosquatting Check: {{{typosquattingCheck}}}
  Email Verification: {{{emailVerification}}}

  Respond in a format that is easily understandable by a non-technical user.
  Be concise and to the point in the summary.
  The confidence score should reflect the certainty of your recommendation based on the available data.
`,
});

const summarizeTrustCheckResultsFlow = ai.defineFlow(
  {
    name: 'summarizeTrustCheckResultsFlow',
    inputSchema: SummarizeTrustCheckResultsInputSchema,
    outputSchema: SummarizeTrustCheckResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
