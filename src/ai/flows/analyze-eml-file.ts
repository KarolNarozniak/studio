
'use server';
/**
 * @fileOverview Analyzes the content of an .eml file to produce trust check results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AnalysisResults } from '@/lib/types';
import { getLiveAnalysisResults } from '@/lib/services/whois-service';
import { simpleParser } from 'mailparser';

// Define input schema for the AI content analysis part
const ContentAnalysisInputSchema = z.object({
  subject: z.string().optional().describe("The subject line of the email."),
  body: z.string().describe("The text content of the email body."),
});

// Define output schema for the AI content analysis
const ContentAnalysisOutputSchema = z.object({
  isSuspicious: z.boolean().describe("Czy treść e-maila jest podejrzana."),
  suspicionReason: z.string().describe("Krótkie wyjaśnienie, dlaczego treść jest uważana za podejrzaną, skupiając się na inżynierii społecznej, pilności lub taktykach phishingowych. Jeśli nie jest podejrzana, stwierdź, że treść wydaje się normalna."),
});

// Define the AI prompt for content analysis
const contentAnalysisPrompt = ai.definePrompt({
    name: 'emlContentAnalysisPrompt',
    input: { schema: ContentAnalysisInputSchema },
    output: { schema: ContentAnalysisOutputSchema },
    prompt: `Jesteś analitykiem cyberbezpieczeństwa. Przeanalizuj poniższy temat i treść e-maila pod kątem oznak phishingu, inżynierii społecznej lub podejrzanej pilności. Odpowiedz w języku polskim.

Temat: {{{subject}}}
---
Treść:
{{{body}}}
---

Na podstawie treści ustal, czy jest ona podejrzana i podaj krótki powód. Szukaj typowych sygnałów ostrzegawczych, takich jak ogólne powitania, pilne wezwania do działania, groźby, prośby o poufne informacje oraz nietypowa gramatyka lub ton.`,
});


const AnalyzeEmlFileInputSchema = z.object({
  fileName: z.string().describe('The name of the .eml file.'),
  fileContent: z.string().describe('The full text content of the .eml file.'),
});
export type AnalyzeEmlFileInput = z.infer<typeof AnalyzeEmlFileInputSchema>;

export type AnalyzeEmlFileOutput = AnalysisResults;


export async function analyzeEmlFile(
  input: AnalyzeEmlFileInput
): Promise<AnalyzeEmlFileOutput> {
    console.log(`Analyzing file with mailparser: ${input.fileName}`);
    
    // 1. Parse the .eml file
    const parsedEmail = await simpleParser(input.fileContent);

    const fromAddress = typeof parsedEmail.from?.value[0]?.address === 'string' 
        ? parsedEmail.from.value[0].address
        : null;

    if (!fromAddress) {
        throw new Error("Could not determine sender's email address from the .eml file.");
    }

    // 2. Perform the standard domain check on the sender's domain
    const analysisResults = await getLiveAnalysisResults(fromAddress);

    // 3. Analyze email content with AI
    const emailBody = parsedEmail.text || parsedEmail.html || '';
    if (emailBody) {
        const { output } = await contentAnalysisPrompt({
            subject: parsedEmail.subject,
            body: emailBody,
        });

        if (output) {
            // 4. Augment results with content analysis findings
            analysisResults.threatIntelligence.isKnownThreat = analysisResults.threatIntelligence.isKnownThreat || output.isSuspicious;
            if (output.isSuspicious && !analysisResults.threatIntelligence.threatTypes.includes('Social Engineering')) {
                analysisResults.threatIntelligence.threatTypes.push('Social Engineering');
            }
            // Add the new contentAnalysis field
            analysisResults.contentAnalysis = {
              isSuspicious: output.isSuspicious,
              suspicionReason: output.suspicionReason,
              extractedBody: emailBody, // Store the full body
            }
        }
    }

    // Override query to show the file name for clarity in the UI.
    analysisResults.query = input.fileName;
    
    return analysisResults;
}

// Note: This is not a full Genkit flow itself but a service function.
// It uses a Genkit prompt internally for the AI-powered part of the analysis.
