
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
  domainReputation: z.string().describe('Informacje o reputacji domeny.'),
  whoisData: z.string().describe('Dane z wyszukiwania WHOIS.'),
  dnsRecords: z.string().describe('Informacje o rekordach DNS.'),
  blacklistStatus: z.string().describe('Status domeny/emaila na czarnej liście.'),
  threatIntelligence: z.string().describe('Raport z analizy zagrożeń.'),
  historicalData: z.string().describe('Dane historyczne domeny.'),
  typosquattingCheck: z.string().describe('Analiza, czy domena jest potencjalną próbą typosquattingu.'),
  websiteCategorization: z.string().describe('Kategorie, do których przypisana jest strona internetowa, np. "Wiadomości i polityka", "Biznes".'),
  ipNetblocks: z.string().describe('Informacje o sieci IP, do której należy serwer, w tym ASN, organizacja i kraj.'),
  emailVerification: z.string().optional().describe('Szczegóły weryfikacji e-maila, jeśli dotyczy.'),
  contentAnalysis: z.string().optional().describe('Analiza AI treści e-maila pod kątem phishingu lub taktyk inżynierii społecznej.'),
});
export type SummarizeTrustCheckResultsInput = z.infer<typeof SummarizeTrustCheckResultsInputSchema>;

const SummarizeTrustCheckResultsOutputSchema = z.object({
  summary: z.string().describe('Zwięzłe podsumowanie wyników analizy.'),
  recommendation: z.enum(['Fake', 'Real']).describe('Rekomendacja na podstawie analizy.'),
  confidenceScore: z.number().describe('Wynik zaufania dla rekomendacji (0-1).'),
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

  Pamiętaj, że celem jest ocena wiarygodności partnera biznesowego. Bądź ostrożny w swoich rekomendacjach. Jeśli istnieją jakiekolwiek poważne sygnały ostrzegawcze (np. podejrzenie typosquattingu, zła reputacja, obecność na czarnych listach, podejrzana treść maila, kategoria strony internetowej niezwiązana z biznesem/logistyką, podejrzana sieć IP), rekomendacja powinna brzmieć "Fake".
  Kluczowe sygnały ostrzegawcze:
  - Reputacja poniżej 50.
  - Domena zarejestrowana niedawno (mniej niż rok temu).
  - Jakiekolwiek podejrzenie typosquattingu.
  - Obecność na czarnych listach.
  - Kategorie strony internetowej takie jak 'Parked Domain', 'Gambling', 'Adult'.
  - Sieć IP należąca do nieznanego dostawcy lub zlokalizowana w nietypowym kraju.
  - Podejrzana treść e-maila.

  Format podsumowania powinien być podobny do tego przykładu:
  "Domena ma dobrą reputację, nie jest na czarnych listach i nie wygląda na próbę typosquattingu. Rekordy DNS są w większości poprawne. Rezultat: Możesz nawiązać współpracę."
  LUB
  "Domena jest potencjalną próbą typosquattingu i znajduje się na czarnej liście. Kategoria strony ('Gry') jest nieoczekiwana dla partnera biznesowego. Reputacja jest bardzo niska. Rezultat: Sprawdź głębiej dany mail/domenę, zalecana najwyższa ostrożność."

  Twoja odpowiedź musi być w formacie JSON.

  Dane do analizy:
  Reputacja domeny: {{{domainReputation}}}
  Kategoryzacja strony: {{{websiteCategorization}}}
  Dane WHOIS: {{{whoisData}}}
  Analiza sieci IP: {{{ipNetblocks}}}
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
