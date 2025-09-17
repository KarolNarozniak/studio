
'use server';
import { chatWithResults } from '@/ai/flows/chat-with-results';
import type { ChatMessage, TrustCheckResult } from '@/lib/types';
import { getLiveAnalysisResults } from '@/lib/services/whois-service';
import { summarizeTrustCheckResults } from '@/ai/flows/summarize-trust-check-results';
import { analyzeEmlFile } from '@/ai/flows/analyze-eml-file';
import { runChatDiagnostics as runChatDiagnosticsLogic } from '@/lib/testing';

/**
 * A server action to perform the trust check analysis.
 * @param formData The form data containing the user's query or file.
 * @returns The full trust check result.
 */
export async function performTrustCheck(
  formData: FormData
): Promise<TrustCheckResult> {
  const query = formData.get('query') as string | null;
  const file = formData.get('file') as File | null;

  if (!query && !file) {
    throw new Error('Query or file is required.');
  }

  let analysis;

  if (file) {
    // 1a. Analyze EML file
    const fileContent = await file.text();
    analysis = await analyzeEmlFile({fileName: file.name, fileContent});
  } else if (query) {
    // 1b. Get live analysis data for domain/email
    analysis = await getLiveAnalysisResults(query);
  } else {
    throw new Error('Invalid input for analysis.');
  }

  // 2. Get AI summary
  const summary = await summarizeTrustCheckResults({
    domainReputation: `Ocena: ${analysis.domainReputation.score}/100 od ${analysis.domainReputation.provider}.`,
    whoisData: `Domena utworzona ${analysis.whoisData.creationDate} i wygasa ${analysis.whoisData.expiryDate}. Rejestrator: ${analysis.whoisData.registrar}. Właściciel: ${analysis.whoisData.owner || 'Brak danych'}.`,
    dnsRecords: `MX: ${analysis.dnsRecords.mx}, SPF: ${analysis.dnsRecords.spf}, DKIM: ${analysis.dnsRecords.dkim}, DMARC: ${analysis.dnsRecords.dmarc}.`,
    blacklistStatus: `Na liście: ${analysis.blacklistStatus.isListed}. Źródła: ${analysis.blacklistStatus.sources.join(', ') || 'Brak'}.`,
    threatIntelligence: `Znane zagrożenie: ${analysis.threatIntelligence.isKnownThreat}. Typy zagrożeń: ${analysis.threatIntelligence.threatTypes.join(', ') || 'Brak'}.`,
    historicalData: `Zmiany właściciela: ${analysis.historicalData.changes}. Ostatnia zmiana: ${analysis.historicalData.lastChangeDate}.`,
    typosquattingCheck: `Potencjalny typosquatting: ${analysis.typosquattingCheck.isPotentialTyposquatting}. Podejrzewana oryginalna domena: ${analysis.typosquattingCheck.suspectedOriginalDomain}. Powód: ${analysis.typosquattingCheck.reason}`,
    emailVerification: analysis.isEmail && analysis.emailVerification ? `Dostarczalny: ${analysis.emailVerification.isDeliverable}, Jednorazowy: ${analysis.emailVerification.isDisposable}, Catch-All: ${analysis.emailVerification.isCatchAll}.` : 'Nie dotyczy',
    contentAnalysis: analysis.contentAnalysis ? `Podejrzana: ${analysis.contentAnalysis.isSuspicious}. Powód: ${analysis.contentAnalysis.suspicionReason}` : 'Nie dotyczy',
  });

  return { analysis, summary };
}


/**
 * A server action to stream the results of a trust check analysis.
 * @param history A history of the chat messages.
 * @param userMessage The user's message.
 * @returns The AI's response to the user's message.
 */
export async function chatAboutResults(
  history: ChatMessage[], // Use the ChatMessage type here
  userMessage: string
): Promise<{ reply: string } | { error: string }> {
  try {
    const reply = await chatWithResults(history, userMessage);
    return { reply };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    console.error('Error in chatAboutResults action:', error);
    return { error };
  }
}

/**
 * A server action to run diagnostics on the chat functionality.
 * @param result The full trust check result.
 * @param userMessage A test message to send.
 * @returns An object containing the logs or an error.
 */
export async function runChatDiagnostics(
  result: TrustCheckResult,
  userMessage: string
): Promise<{ logs: string[] } | { error: string }> {
  try {
    const { analysis, summary } = result;
    const isEmlAnalysis = analysis.query.endsWith('.eml');

    const analysisData = `
- Query: ${analysis.query}
${isEmlAnalysis ? `- Sender's Email: ${analysis.whoisData.domain}` : ''}
- Overall Summary: ${summary.summary}
- Domain Reputation: Score: ${analysis.domainReputation.score}/100 from ${analysis.domainReputation.provider}.
- WHOIS Data: Domain created on ${analysis.whoisData.creationDate} and expires on ${analysis.whoisData.expiryDate}. Registrar: ${analysis.whoisData.registrar}. Owner: ${analysis.whoisData.owner || 'N/A'}.
- DNS Records: MX: ${analysis.dnsRecords.mx}, SPF: ${analysis.dnsRecords.spf}, DKIM: ${analysis.dnsRecords.dkim}, DMARC: ${analysis.dnsRecords.dmarc}.
- Blacklist Status: Is Listed: ${analysis.blacklistStatus.isListed}. Sources: ${analysis.blacklistStatus.sources.join(', ') || 'None'}.
- Threat Intelligence: Is Known Threat: ${analysis.threatIntelligence.isKnownThreat}. Threat Types: ${analysis.threatIntelligence.threatTypes.join(", ") || "None"}.
- Historical Data: Ownership Changes: ${analysis.historicalData.changes}. Last Change: ${analysis.historicalData.lastChangeDate}.
- Typosquatting Check: Is Potential Typosquatting: ${analysis.typosquattingCheck.isPotentialTyposquatting}. Suspected Original: ${analysis.typosquattingCheck.suspectedOriginalDomain}. Reason: ${analysis.typosquattingCheck.reason}
- Email Verification: ${analysis.isEmail && analysis.emailVerification ? `Deliverable: ${analysis.emailVerification.isDeliverable}, Disposable: ${analysis.emailVerification.isDisposable}, Catch-All: ${analysis.emailVerification.isCatchAll}.` : 'N/A'}
- E-mail Content Analysis: ${analysis.contentAnalysis ? `Suspicious: ${analysis.contentAnalysis.isSuspicious}. Reason: ${analysis.contentAnalysis.suspicionReason}` : 'N/A'}
- Raw API Responses: ${analysis.rawApiResponses ? JSON.stringify(analysis.rawApiResponses) : 'N/A'}
  `.trim();

    const logs = await runChatDiagnosticsLogic(analysisData, userMessage);
    return { logs };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error };
  }
}
