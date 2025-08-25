'use server';

import type { TrustCheckResult } from './types';
import { chatWithResults } from '@/ai/flows/chat-with-results';
import { z } from 'genkit';
import { Message } from 'genkit';

export async function runChatDiagnostics(
    analysisData: string,
    userMessage: string,
): Promise<string[]> {
    const logs: string[] = [];
    
    logs.push("--- Starting Chat Diagnostics ---");

    // Test 1: Data Formatting
    let history: Message[] | null = null;
    try {
        logs.push("[1/3] Formatting input data...");
        const systemPrompt = `You are an AI assistant for the TrustCheck application. Your task is to answer user questions based on the security analysis report for an email or domain. Use ONLY the information provided in the report. If the information is not in the report, state that you do not have that information. Here is the full analysis report:\n---\n${analysisData}\n---`;
        history = [{ role: 'system', content: [{ text: systemPrompt }] }];
        logs.push("  [SUCCESS] Data formatted successfully.");
        logs.push("  Formatted Data for AI:");
        logs.push(JSON.stringify({ history, userMessage }, null, 2)); 
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        logs.push(`  [FAILURE] Failed to format data: ${error}`);
        logs.push("--- Diagnostics Aborted ---");
        return logs;
    }

    // Test 2: AI Flow Execution
    let aiResponse: string | null = null;
    try {
        logs.push("\n[2/3] Calling the main AI chat flow (chatWithResults)...");
        aiResponse = await chatWithResults(history, userMessage);
        logs.push("  [SUCCESS] AI flow executed.");
        logs.push("  AI Response:");
        logs.push(aiResponse);
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        logs.push(`  [FAILURE] AI flow execution failed: ${error}`);
        logs.push("--- Diagnostics Aborted ---");
        return logs;
    }
    
    // Test 3: Validate AI Response
    logs.push("\n[3/3] Validating AI response...");
    if (aiResponse && !aiResponse.includes("I'm sorry") && !aiResponse.includes("error occurred")) {
        logs.push("  [SUCCESS] AI provided a valid, content-rich response.");
        logs.push("--- Diagnostics Complete: All tests passed! ---");
    } else {
        logs.push("  [FAILURE] AI returned a generic or error response.");
        logs.push("--- Diagnostics Complete: Validation failed. ---");
    }


    return logs;
}
