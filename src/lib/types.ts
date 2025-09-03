// src/lib/types.ts

import type {SummarizeTrustCheckResultsOutput} from '@/ai/flows/summarize-trust-check-results';

// A generic structure for a trust check analysis result
export interface AnalysisResults {
  query: string;
  isEmail: boolean;
  domainReputation: {
    score: number;
    provider: string;
  };
  whoisData: {
    domain: string;
    registrar: string;
    creationDate: string;
    expiryDate: string;
    owner: string | null;
  };
  dnsRecords: {
    mx: boolean;
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
  blacklistStatus: {
    isListed: boolean;
    sources: string[];
  };
  threatIntelligence: {
    isKnownThreat: boolean;
    threatTypes: string[];
  };
  historicalData: {
    changes: number;
    lastChangeDate: string;
  };
  typosquattingCheck: {
    isPotentialTyposquatting: boolean;
    suspectedOriginalDomain: string;
    reason: string;
  };
  emailVerification?: {
    isDeliverable: boolean;
    isDisposable: boolean;
    isCatchAll: boolean;
  };
  contentAnalysis?: {
    isSuspicious: boolean;
    suspicionReason: string;
    extractedBody: string;
  }
}


// The combined result of a trust check
export interface TrustCheckResult {
  analysis: AnalysisResults;
  summary: SummarizeTrustCheckResultsOutput;
}

// A generic structure for chat messages
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
}
