// src/lib/types.ts

import type {SummarizeTrustCheckResultsOutput} from '@/ai/flows/summarize-trust-check-results';
import type {DetectTyposquattingOutput} from '@/ai/flows/detect-typosquatting';

// A structure for the Website Categorization API response
export interface WebsiteCategorization {
  categories: {
    id: number;
    name: string;
    confidence: number;
  }[];
  websiteResponded: boolean;
}

// A structure for the IP Netblocks API response
export interface IpNetblocks {
  asn?: number;
  organization?: string;
  country?: string;
  range?: string;
  error?: string;
}

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
    ipAddress: string | null;
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
  websiteCategorization: WebsiteCategorization;
  ipNetblocks: IpNetblocks;
  websiteContent?: {
    content: string | null;
    error?: string;
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
  };
  rawApiResponses?: RawApiResponses;
}

export interface RawApiResponses {
  whois: any;
  reputation: any;
  threat: any;
  dns: any;
  email: any;
  typosquatting: DetectTyposquattingOutput;
  websiteCategorization: any;
  ipNetblocks: any;
  websiteContent: any;
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
