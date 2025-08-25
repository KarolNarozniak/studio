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
  // Instead of a generic `any`, we now expect stringified versions of the key data points.
  // This makes the prompt structure more reliable.
  query: z.string().describe('The original email or domain that was checked.'),
  summary: z.string().describe('The AI-generated summary of the results.'),
  domainReputation: z.string().describe('Domain reputation information.'),
  whoisData: z.string().describe('WHOIS lookup data.'),
  dnsRecords: z.string().describe('DNS records information.'),
  blacklistStatus: z.string().describe('Blacklist status of the domain/email.'),
  threatIntelligence: z.string().describe('Threat intelligence report.'),
  historicalData: z.string().describe('Historical data of the domain.'),
  typosquattingCheck: z.string().describe('Analysis of whether the domain is a potential typosquatting attempt.'),
  emailVerification: z.string().optional().describe('Email verification details, if applicable.'),
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
  prompt: `You are a helpful AI assistant embedded in the FakeOrNot application. Your role is to answer user questions about the analysis results for the query: {{{query}}}.

  Use the following data to provide clear, concise, and easy-to-understand explanations. Do not make up information. If the answer isn't in the provided data, say that you don't have that information.

  Here is the analysis data:
  - Overall Summary: {{{summary}}}
  - Domain Reputation: {{{domainReputation}}}
  - WHOIS Data: {{{whoisData}}}
  - DNS Records: {{{dnsRecords}}}
  - Blacklist Status: {{{blacklistStatus}}}
  - Threat Intelligence: {{{threatIntelligence}}}
  - Historical Data: {{{historicalData}}}
  - Typosquatting Check: {{{typosquattingCheck}}}
  - Email Verification: {{{emailVerification}}}

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
    // Handle cases where the model might return a null or empty response
    if (output === null || output === undefined) {
      return "I'm sorry, I wasn't able to generate a response for that. Please try rephrasing your question.";
    }
    return output;
  }
);
