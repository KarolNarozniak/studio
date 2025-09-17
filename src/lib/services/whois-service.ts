
import type { AnalysisResults, RawApiResponses } from "@/lib/types";
import { detectTyposquatting } from "@/ai/flows/detect-typosquatting";

const API_KEY = process.env.WHOISXML_API_KEY;
const BASE_URLS = {
    whois: "https://www.whoisxmlapi.com/whoisserver/WhoisService",
    dns: "https://www.whoisxmlapi.com/whoisserver/DNSService",
    reputation: "https://domain-reputation.whoisxmlapi.com/api/v2",
    threatIntelligence: "https://threat-intelligence.whoisxmlapi.com/api/v1",
    emailVerification: "https://emailverification.whoisxmlapi.com/api/v3",
};

// --- API Response Types ---
interface WhoisRecord {
    createdDate?: string;
    expiresDate?: string;
    registrant?: { organization?: string };
    registrarName?: string;
    estimatedDomainAge?: number;
}
interface WhoisAPIResponse {
    WhoisRecord: WhoisRecord;
}

interface DnsRecord {
    dnsType: string;
    strings?: string[];
}
interface DnsAPIResponse {
    DNSData: {
        dnsRecords: DnsRecord[];
    };
}

interface ReputationAPIResponse {
    reputationScore: number;
}

interface ThreatIntelligenceAPIResponse {
    results: { threatType: string }[];
}

interface EmailVerificationAPIResponse {
    smtpCheck: "true" | "false" | null;
    disposableCheck: "true" | "false" | null;
    catchAllCheck: "true" | "false" | null;
}


// --- Helper Functions ---
async function fetchAPI(url: string, params: Record<string, string>) {
    if (!API_KEY) {
        throw new Error("WHOISXML_API_KEY environment variable not set.");
    }
    const queryParams = new URLSearchParams({ apiKey: API_KEY, ...params });
    const fullUrl = `${url}?${queryParams.toString()}`;
    console.log(`Fetching from WhoisXMLAPI: ${url}`);
    
    try {
        const response = await fetch(fullUrl, { cache: 'no-store' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from ${fullUrl}:`, error);
        return null; // Return null on error to avoid breaking the entire analysis
    }
}

function safeDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toISOString().split('T')[0];
    } catch {
        return 'Invalid Date';
    }
}


// --- Main Analysis Function ---
export const getLiveAnalysisResults = async (query: string): Promise<AnalysisResults> => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
    const domain = isEmail ? query.split('@')[1] : query;

    // --- Perform API Calls in Parallel ---
    const [
        whoisData,
        reputationData,
        threatData,
        dnsData,
        emailData,
        typosquattingData,
    ] = await Promise.all([
        fetchAPI(BASE_URLS.whois, { domainName: domain, outputFormat: 'JSON' }),
        fetchAPI(BASE_URLS.reputation, { domainName: domain, mode: 'fast' }),
        fetchAPI(BASE_URLS.threatIntelligence, { ioc: domain }),
        fetchAPI(BASE_URLS.dns, { domainName: domain, type: '_all', outputFormat: 'JSON' }),
        isEmail ? fetchAPI(BASE_URLS.emailVerification, { emailAddress: query }) : Promise.resolve(null),
        detectTyposquatting({ domain }),
    ]);

    // --- Process WHOIS Data ---
    const record: WhoisRecord = whoisData?.WhoisRecord ?? {};
    const processedWhois = {
        domain,
        registrar: record.registrarName ?? 'N/A',
        creationDate: safeDate(record.createdDate),
        expiryDate: safeDate(record.expiresDate),
        owner: record.registrant?.organization ?? null,
    };

    // --- Process DNS Data ---
    const records: DnsRecord[] = dnsData?.DNSData?.dnsRecords ?? [];
    const hasRecord = (type: string) => records.some(r => r.dnsType === type);
    const getTxtRecord = (val: string) => records.find(r => r.dnsType === 'TXT' && r.strings?.some(s => s.includes(val)));
    const processedDns = {
        mx: hasRecord('MX'),
        spf: !!getTxtRecord('v=spf1'),
        dkim: !!getTxtRecord('_domainkey'),
        dmarc: !!getTxtRecord('_dmarc'),
    };

    // --- Process Threat Intelligence & Blacklist ---
    const threats: { threatType: string }[] = threatData?.results ?? [];
    const processedThreats = {
        isKnownThreat: threats.length > 0,
        threatTypes: threats.map(t => t.threatType),
    };
    const processedBlacklist = {
        isListed: threats.length > 0,
        sources: threats.map(t => `ThreatIntel: ${t.threatType}`),
    };

    // --- Process Email Verification ---
    const emailInfo: EmailVerificationAPIResponse | null = emailData;
    const processedEmailVerification = isEmail && emailInfo ? {
        isDeliverable: emailInfo.smtpCheck === 'true',
        isDisposable: emailInfo.disposableCheck === 'true',
        isCatchAll: emailInfo.catchAllCheck === 'true',
    } : undefined;
    
    // --- Assemble Raw API Responses ---
    const rawApiResponses: RawApiResponses = {
        whois: whoisData,
        reputation: reputationData,
        threat: threatData,
        dns: dnsData,
        email: emailData,
        typosquatting: typosquattingData,
    };

    // --- Assemble Final Result ---
    return {
        query,
        isEmail,
        domainReputation: {
            score: reputationData?.reputationScore ?? 0,
            provider: "WhoisXMLAPI",
        },
        whoisData: processedWhois,
        dnsRecords: processedDns,
        blacklistStatus: processedBlacklist,
        threatIntelligence: processedThreats,
        historicalData: {
            changes: 0, // Not available in these APIs
            lastChangeDate: 'N/A', // Not directly available, could use whois updated date
        },
        typosquattingCheck: {
            isPotentialTyposquatting: typosquattingData.isPotentialTyposquatting,
            suspectedOriginalDomain: typosquattingData.suspectedOriginalDomain,
            reason: typosquattingData.reason,
        },
        rawApiResponses,
        ...(isEmail && { emailVerification: processedEmailVerification }),
    };
};
