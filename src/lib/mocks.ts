import { AnalysisResults } from "./types";
import { faker } from '@faker-js/faker';

// A simple deterministic seed based on string length
const seed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export const getMockAnalysisResults = (query: string): AnalysisResults => {
    faker.seed(seed(query));
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
    const domain = isEmail ? query.split('@')[1] : query;
    const isRisky = query.includes('bad') || query.includes('phish') || query.includes('spam');
    
    const creationDate = faker.date.past({ years: isRisky ? 0.1 : 5 });

    return {
        query,
        isEmail,
        domainReputation: {
            score: isRisky ? faker.number.int({ min: 5, max: 40 }) : faker.number.int({ min: 80, max: 99 }),
            provider: "ReputableScan Inc.",
        },
        whoisData: {
            domain,
            registrar: faker.company.name(),
            creationDate: creationDate.toISOString().split('T')[0],
            expiryDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
            owner: isRisky ? "REDACTED FOR PRIVACY" : faker.company.name(),
        },
        dnsRecords: {
            mx: !isRisky,
            spf: !isRisky,
            dkim: !isRisky && faker.datatype.boolean(),
            dmarc: !isRisky && faker.datatype.boolean(),
        },
        blacklistStatus: {
            isListed: isRisky && faker.datatype.boolean(),
            sources: isRisky ? ['SpamGuard', 'ThreatBlock'].slice(0, faker.number.int({min: 0, max: 2})) : [],
        },
        threatIntelligence: {
            isKnownThreat: isRisky && faker.datatype.boolean(),
            threatTypes: isRisky ? ['Phishing', 'Malware'].slice(0, faker.number.int({min: 0, max: 2})) : [],
        },
        historicalData: {
            changes: faker.number.int({ min: 0, max: 5 }),
            lastChangeDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
        },
        ...(isEmail && {
            emailVerification: {
                isDeliverable: !isRisky,
                isDisposable: isRisky && faker.datatype.boolean(),
                isCatchAll: faker.datatype.boolean(),
            },
        }),
    };
};
