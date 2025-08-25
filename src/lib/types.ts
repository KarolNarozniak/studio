import type { SummarizeTrustCheckResultsOutput } from "@/ai/flows/summarize-trust-check-results";

export interface DomainReputation {
    score: number;
    provider: string;
}

export interface WhoisData {
  domain: string;
  registrar: string;
  creationDate: string;
  expiryDate: string;
  owner: string;
}

export interface DnsRecords {
  mx: boolean;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
}

export interface BlacklistStatus {
  isListed: boolean;
  sources: string[];
}

export interface ThreatIntelligenceReport {
  isKnownThreat: boolean;
  threatTypes: string[];
}

export interface HistoricalData {
    changes: number;
    lastChangeDate: string;
}

export interface EmailVerification {
    isDeliverable: boolean;
    isDisposable: boolean;
    isCatchAll: boolean;
}

export interface TyposquattingCheck {
  isPotentialTyposquatting: boolean;
  suspectedOriginalDomain: string;
  reason: string;
}

export interface AnalysisResults {
  query: string;
  isEmail: boolean;
  domainReputation: DomainReputation;
  whoisData: WhoisData;
  dnsRecords: DnsRecords;
  blacklistStatus: BlacklistStatus;
  threatIntelligence: ThreatIntelligenceReport;
  historicalData: HistoricalData;
  typosquattingCheck: TyposquattingCheck;
  emailVerification?: EmailVerification;
}

export interface TrustCheckResult {
  analysis: AnalysisResults;
  summary: SummarizeTrustCheckResultsOutput;
}
