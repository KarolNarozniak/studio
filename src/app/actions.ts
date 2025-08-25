"use server";

import { summarizeTrustCheckResults } from "@/ai/flows/summarize-trust-check-results";
import { chatWithResults } from "@/ai/flows/chat-with-results";
import { detectTyposquatting } from "@/ai/flows/detect-typosquatting";
import { getMockAnalysisResults } from "@/lib/mocks";
import type { TrustCheckResult } from "@/lib/types";
import { runChatDiagnostics as runChatDiagnosticsLogic } from "@/lib/testing";
import type { Message } from "genkit";


export async function performTrustCheck(
  formData: FormData
): Promise<TrustCheckResult | { error: string }> {
  const query = formData.get("query") as string;

  if (!query) {
    return { error: "Input query is missing." };
  }

  // Basic validation
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!domainRegex.test(query) && !emailRegex.test(query)) {
    return { error: "Please enter a valid domain or email address." };
  }
  
  try {
    // 1. Get mock analysis data
    const analysis = getMockAnalysisResults(query);

    // 2. Perform typosquatting check (in parallel)
    const domain = analysis.isEmail ? query.split('@')[1] : query;
    const typosquattingPromise = detectTyposquatting({ domain });

    // 3. Wait for all checks and format data for the summary AI prompt
    const typosquattingResult = await typosquattingPromise;
    analysis.typosquattingCheck = typosquattingResult;


    const aiInput = {
      domainReputation: `Score: ${analysis.domainReputation.score}/100 by ${analysis.domainReputation.provider}`,
      whoisData: `Created: ${analysis.whoisData.creationDate}, Expires: ${analysis.whoisData.expiryDate}, Registrar: ${analysis.whoisData.registrar}`,
      dnsRecords: `MX: ${analysis.dnsRecords.mx}, SPF: ${analysis.dnsRecords.spf}, DKIM: ${analysis.dnsRecords.dkim}, DMARC: ${analysis.dnsRecords.dmarc}`,
      blacklistStatus: `Listed: ${analysis.blacklistStatus.isListed} on ${analysis.blacklistStatus.sources.length} blacklists.`,
      threatIntelligence: `Known Threat: ${analysis.threatIntelligence.isKnownThreat}, Types: ${analysis.threatIntelligence.threatTypes.join(", ") || "N/A"}`,
      historicalData: `Changes: ${analysis.historicalData.changes}, Last Change: ${analysis.historicalData.lastChangeDate}`,
      typosquattingCheck: `Potential Typosquatting: ${typosquattingResult.isPotentialTyposquatting}. Suspected Original: ${typosquattingResult.suspectedOriginalDomain}. Reason: ${typosquattingResult.reason}`,
      emailVerification: analysis.emailVerification ? `Deliverable: ${analysis.emailVerification.isDeliverable}, Disposable: ${analysis.emailVerification.isDisposable}` : 'Not an email address.',
    };

    // 4. Call the summary AI flow
    const summary = await summarizeTrustCheckResults(aiInput);

    // 5. Return combined results
    return { analysis, summary };
  } catch (e) {
    console.error("Error performing trust check:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during analysis.";
    return { error: errorMessage };
  }
}

const formatAnalysisDataForPrompt = (analysisResults: TrustCheckResult): string => {
    const { analysis, summary } = analysisResults;
    return `
- Query: ${analysis.query}
- Overall Summary: ${summary.summary}
- Domain Reputation: Score: ${analysis.domainReputation.score}/100 from ${analysis.domainReputation.provider}.
- WHOIS Data: Domain created on ${analysis.whoisData.creationDate} and expires on ${analysis.whoisData.expiryDate}. Registrar: ${analysis.whoisData.registrar}. Owner: ${analysis.whoisData.owner || 'N/A'}.
- DNS Records: MX: ${analysis.dnsRecords.mx}, SPF: ${analysis.dnsRecords.spf}, DKIM: ${analysis.dnsRecords.dkim}, DMARC: ${analysis.dnsRecords.dmarc}.
- Blacklist Status: Is Listed: ${analysis.blacklistStatus.isListed}. Sources: ${analysis.blacklistStatus.sources.join(', ') || 'None'}.
- Threat Intelligence: Is Known Threat: ${analysis.threatIntelligence.isKnownThreat}. Threat Types: ${analysis.threatIntelligence.threatTypes.join(", ") || "None"}.
- Historical Data: Ownership Changes: ${analysis.historicalData.changes}. Last Change: ${analysis.historicalData.lastChangeDate}.
- Typosquatting Check: Is Potential Typosquatting: ${analysis.typosquattingCheck.isPotentialTyposquatting}. Suspected Original: ${analysis.typosquattingCheck.suspectedOriginalDomain}. Reason: ${analysis.typosquattingCheck.reason}
- Email Verification: ${analysis.isEmail && analysis.emailVerification ? `Deliverable: ${analysis.emailVerification.isDeliverable}, Disposable: ${analysis.emailVerification.isDisposable}, Catch-All: ${analysis.emailVerification.isCatchAll}.` : 'N/A'}
  `.trim();
}


export async function chatAboutResults(
  history: Message[],
  userMessage: string
): Promise<{ reply: string } | { error: string }> {
  if (!userMessage) {
    return { error: "Message is empty." };
  }
  if (!history) {
    return { error: "Analysis results not found." };
  }

  try {
    const reply = await chatWithResults(history, userMessage);
    return { reply };
  } catch (e) {
    console.error("Error in chat action:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during the chat.";
    return { error: errorMessage };
  }
}

export async function runChatDiagnostics(
    result: TrustCheckResult,
    userMessage: string
): Promise<{ logs: string[] } | { error: string }> {
    try {
        const analysisData = formatAnalysisDataForPrompt(result);
        const logs = await runChatDiagnosticsLogic(analysisData, userMessage);
        return { logs };
    } catch (e) {
        console.error("Error running diagnostics:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during diagnostics.";
        return { error: errorMessage };
    }
}
