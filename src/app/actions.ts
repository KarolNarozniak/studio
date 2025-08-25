"use server";

import { summarizeTrustCheckResults } from "@/ai/flows/summarize-trust-check-results";
import { chatWithResults } from "@/ai/flows/chat-with-results";
import { detectTyposquatting } from "@/ai/flows/detect-typosquatting";
import { getMockAnalysisResults } from "@/lib/mocks";
import type { TrustCheckResult } from "@/lib/types";

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

export async function chatAboutResults(
  analysisResults: TrustCheckResult,
  userMessage: string
): Promise<{ reply: string } | { error: string }> {
  if (!userMessage) {
    return { error: "Message is empty." };
  }
  if (!analysisResults) {
    return { error: "Analysis results not found." };
  }

  try {
    const reply = await chatWithResults({ analysisResults, userMessage });
    return { reply };
  } catch (e) {
    console.error("Error in chat action:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during the chat.";
    return { error: errorMessage };
  }
}
