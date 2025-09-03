
'use server';
/**
 * @fileOverview Analyzes the content of an .eml file to produce trust check results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AnalysisResults } from '@/lib/types';
import { getMockAnalysisResults } from '@/lib/mocks';
import { simpleParser } from 'mailparser';

// Define input schema for the AI content analysis part
const ContentAnalysisInputSchema = z.object({
  subject: z.string().optional().describe("The subject line of the email."),
  body: z.string().describe("The text content of the email body."),
});

// Define output schema for the AI content analysis
const ContentAnalysisOutputSchema = z.object({
  isSuspicious: z.boolean().describe("Whether the email content is suspicious."),
  suspicionReason: z.string().describe("A brief explanation of why the content is considered suspicious, focusing on social engineering, urgency, or phishing tactics. If not suspicious, state that the content appears normal."),
});

// Define the AI prompt for content analysis
const contentAnalysisPrompt = ai.definePrompt({
    name: 'emlContentAnalysisPrompt',
    input: { schema: ContentAnalysisInputSchema },
    output: { schema: ContentAnalysisOutputSchema },
    prompt: `You are a cybersecurity analyst. Analyze the following email subject and body for signs of phishing, social engineering, or suspicious urgency.

Subject: {{{subject}}}
---
Body:
{{{body}}}
---

Based on the content, determine if it is suspicious and provide a brief reason. Look for common red flags like generic greetings, urgent calls to action, threats, requests for sensitive information, and unusual grammar or tone.`,
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
    const analysisResults = getMockAnalysisResults(fromAddress);

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
              extractedBody: emailBody.substring(0, 500) + (emailBody.length > 500 ? '...' : '') // Truncate for display
            }
        }
    }

    // Override query to show the file name for clarity in the UI.
    analysisResults.query = input.fileName;
    
    return analysisResults;
}

// Note: This is not a full Genkit flow itself but a service function.
// It uses a Genkit prompt internally for the AI-powered part of the analysis.
