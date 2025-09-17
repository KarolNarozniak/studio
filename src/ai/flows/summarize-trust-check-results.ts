
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
  contentAnalysis: z.string().optional().describe('AI analysis of the email body content for phishing or social engineering tactics.'),
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
  prompt: `Jesteś analitykiem cyberbezpieczeństwa. Twoim zadaniem jest analiza wyników weryfikacji domeny/emaila i przedstawienie zwięzłego podsumowania oraz rekomendacji dla pracownika firmy logistycznej, który weryfikuje potencjalnego przewoźnika.

  Bazując na poniższych danych, wygeneruj zwięzłe, jedno- lub dwuzdaniowe podsumowanie oraz rekomendację "Fake" (Fałszywy) lub "Real" (Prawdziwy).
  Odpowiedz w języku polskim.

  Pamiętaj, że celem jest ocena wiarygodności partnera biznesowego. Bądź ostrożny w swoich rekomendacjach. Jeśli istnieją jakiekolwiek poważne sygnały ostrzegawcze (np. podejrzenie typosquattingu, zła reputacja, obecność na czarnych listach, podejrzana treść maila), rekomendacja powinna brzmieć "Fake".

  Format podsumowania powinien być podobny do tego przykładu:
  "Domena ma dobrą reputację, nie jest na czarnych listach i nie wygląda na próbę typosquattingu. Rekordy DNS są w większości poprawne. Rezultat: Możesz nawiązać współpracę."
  LUB
  "Domena jest potencjalną próbą typosquattingu i znajduje się na czarnej liście. Reputacja jest bardzo niska. Rezultat: Sprawdź głębiej dany mail/domenę, zalecana najwyższa ostrożność."

  Twoja odpowiedź musi być w formacie JSON.

  Dane do analizy:
  Reputacja domeny: {{{domainReputation}}}
  Dane WHOIS: {{{whoisData}}}
  Rekordy DNS: {{{dnsRecords}}}
  Status na czarnej liście: {{{blacklistStatus}}}
  Analiza zagrożeń: {{{threatIntelligence}}}
  Dane historyczne: {{{historicalData}}}
  Sprawdzenie pod kątem typosquattingu: {{{typosquattingCheck}}}
  Weryfikacja e-maila: {{{emailVerification}}}
  Analiza treści e-maila: {{{contentAnalysis}}}
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
