
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
    domainReputation: `Score: ${analysis.domainReputation.score}/100 from ${analysis.domainReputation.provider}.`,
    whoisData: `Domain created on ${analysis.whoisData.creationDate} and expires on ${analysis.whoisData.expiryDate}. Registrar: ${analysis.whoisData.registrar}. Owner: ${analysis.whoisData.owner || 'N/A'}.`,
    dnsRecords: `MX: ${analysis.dnsRecords.mx}, SPF: ${analysis.dnsRecords.spf}, DKIM: ${analysis.dnsRecords.dkim}, DMARC: ${analysis.dnsRecords.dmarc}.`,
    blacklistStatus: `Is Listed: ${analysis.blacklistStatus.isListed}. Sources: ${analysis.blacklistStatus.sources.join(', ') || 'None'}.`,
    threatIntelligence: `Is Known Threat: ${analysis.threatIntelligence.isKnownThreat}. Threat Types: ${analysis.threatIntelligence.threatTypes.join(', ') || 'None'}.`,
    historicalData: `Ownership Changes: ${analysis.historicalData.changes}. Last Change: ${analysis.historicalData.lastChangeDate}.`,
    typosquattingCheck: `Is Potential Typosquatting: ${analysis.typosquattingCheck.isPotentialTyposquatting}. Suspected Original: ${analysis.typosquattingCheck.suspectedOriginalDomain}. Reason: ${analysis.typosquattingCheck.reason}`,
    emailVerification: analysis.isEmail && analysis.emailVerification ? `Deliverable: ${analysis.emailVerification.isDeliverable}, Disposable: ${analysis.emailVerification.isDisposable}, Catch-All: ${analysis.emailVerification.isCatchAll}.` : 'N/A',
    contentAnalysis: analysis.contentAnalysis ? `Suspicious: ${analysis.contentAnalysis.isSuspicious}. Reason: ${analysis.contentAnalysis.suspicionReason}` : 'N/A',
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
  `.trim();

    const logs = await runChatDiagnosticsLogic(analysisData, userMessage);
    return { logs };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error };
  }
}
