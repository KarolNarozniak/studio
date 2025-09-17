
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
import type { AnalysisResults } from '@/lib/types';


// This creates a Zod schema from the TypeScript type.
const AnalysisResultsSchema = z.object({
  query: z.string(),
  isEmail: z.boolean(),
  domainReputation: z.any(),
  whoisData: z.any(),
  dnsRecords: z.any(),
  blacklistStatus: z.any(),
  threatIntelligence: z.any(),
  historicalData: z.any(),
  typosquattingCheck: z.any(),
  websiteCategorization: z.any(),
  ipNetblocks: z.any(),
  websiteContent: z.any().optional(),
  emailVerification: z.any().optional(),
  contentAnalysis: z.any().optional(),
  rawApiResponses: z.any().optional(),
});

export type SummarizeTrustCheckResultsInput = AnalysisResults;


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
  input: { schema: AnalysisResultsSchema },
  output: { schema: SummarizeTrustCheckResultsOutputSchema },
  prompt: `
Jesteś analitykiem cyberbezpieczeństwa wspierającym spedytora w firmie logistycznej. 
Twoim zadaniem jest ocena, czy domena/email, z którego nadeszła propozycja współpracy, należy do wiarygodnego partnera biznesowego czy może być próbą oszustwa. 

### Instrukcje:
- Na podstawie dostarczonych danych wygeneruj krótkie (1–2 zdania) podsumowanie i jednoznaczną rekomendację: "Fake" (Fałszywy) lub "Real" (Prawdziwy). 
- Odpowiedz w języku polskim.
- Pamiętaj: patrzymy na sytuację **oczami spedytora**, który musi ocenić, czy nawiązać współpracę z przewoźnikiem lub partnerem.
- Jeśli występują mocne sygnały ostrzegawcze, rekomendacja powinna brzmieć "Fake".

### Kluczowe kryteria i sygnały ostrzegawcze:
- **Adres e-mail**: 
  - Jeśli nadawca korzysta z darmowego dostawcy poczty (Gmail, Outlook, Proton, Yahoo, WP, Onet itp.), to jest to **silny sygnał ostrzegawczy** – poważna firma logistyczna lub przewoźnik powinien używać własnej domeny. W takim przypadku współpraca jest odradzana.
- **Wiek domeny (WHOIS)**: domeny młodsze niż rok → wysokie ryzyko; stare i stabilne → pozytywny sygnał.
- **Reputacja domeny**: wynik < 50 → mocny sygnał ostrzegawczy.
- **Kraj rejestracji i hostingu (IP Netblocks)**: nietypowe lokalizacje (RU, CN, NG itp.) zwiększają ryzyko.
- **Polityki SPF, DKIM, DMARC**: 
  - "fail" = sygnał ryzyka, 
  - "pass" = pozytywny sygnał, 
  - ale same w sobie nie przesądzają o wyniku.
- **Treść e-maila**: sprawdzaj elementy socjotechniki (pilność, groźby, prośba o przelew, linki zewnętrzne, załączniki .exe/.zip).
- **Treść strony internetowej**: Przeanalizuj treść pod kątem profesjonalizmu, spójności z deklarowaną działalnością (logistyka/transport) i obecności danych kontaktowych. Brak strony, "lorem ipsum" lub treść niezwiązana z branżą to sygnały ostrzegawcze.
- **Typosquatting / lookalike**: 
  - zagrożenie tylko przy oczywistych przypadkach (homograf, literówka w znanej marce, kopiowanie layoutu),
  - nie klasyfikuj jako atak, jeśli to po prostu dwie różne firmy o podobnych nazwach.
- **Kategorie stron**: "Parked Domain", "Gambling", "Adult", "Redirect/Tracking only" → sygnał ostrzegawczy.
- **Kompromitacja**: stare CMS-y, malware, redirecty → zwiększone ryzyko.

### Przykłady formatu podsumowania:
- Real:  
  "Domena ma ponad 10 lat, wysoką reputację, poprawne SPF/DMARC i brak oznak typosquattingu. Treść strony jest profesjonalna. Rezultat: Możesz nawiązać współpracę."
- Fake:  
  "Adres korzysta z darmowego Gmaila, domena jest nowa i reputacja < 50. Treść wiadomości zawiera elementy socjotechniki. Rezultat: Fałszywy."
- Fake:  
  "Domena zarejestrowana 5 dni temu, brak SPF/DMARC, strona należy do kategorii 'Gambling'. Rezultat: Fałszywy."
- Real:  
  "Domena banku z wieloletnią historią, EV TLS i pełnymi politykami SPF/DMARC. Rezultat: Prawdziwy partner."
- Fake:  
  "Domena wykorzystuje homograf, podszywając się pod znaną markę i zawiera formularz logowania. Strona internetowa nie istnieje. Rezultat: Fałszywy."

### Dane do analizy:
{{#if domainReputation}}Reputacja domeny: {{{json domainReputation}}}{{/if}}
{{#if websiteCategorization}}Kategoryzacja strony: {{{json websiteCategorization}}}{{/if}}
{{#if whoisData}}Dane WHOIS: {{{json whoisData}}}{{/if}}
{{#if ipNetblocks}}Analiza sieci IP: {{{json ipNetblocks}}}{{/if}}
{{#if dnsRecords}}Rekordy DNS: {{{json dnsRecords}}}{{/if}}
{{#if blacklistStatus}}Status na czarnej liście: {{{json blacklistStatus}}}{{/if}}
{{#if threatIntelligence}}Analiza zagrożeń: {{{json threatIntelligence}}}{{/if}}
{{#if historicalData}}Dane historyczne: {{{json historicalData}}}{{/if}}
{{#if typosquattingCheck}}Sprawdzenie pod kątem typosquattingu: {{{json typosquattingCheck}}}{{/if}}
{{#if websiteContent}}Treść strony internetowej: {{{json websiteContent}}}{{/if}}
{{#if emailVerification}}Weryfikacja e-maila: {{{json emailVerification}}}{{/if}}
{{#if contentAnalysis}}Analiza treści e-maila: {{{json contentAnalysis}}}{{/if}}
`
});

const summarizeTrustCheckResultsFlow = ai.defineFlow(
  {
    name: 'summarizeTrustCheckResultsFlow',
    inputSchema: AnalysisResultsSchema,
    outputSchema: SummarizeTrustCheckResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
