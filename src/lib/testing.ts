// This is a new file: src/lib/testing.ts
'use server';

import type { TrustCheckResult } from './types';
import { chatWithResults, type ChatWithResultsInput } from '@/ai/flows/chat-with-results';

export async function runChatDiagnostics(
    result: TrustCheckResult,
    userMessage: string,
    formatter: (result: TrustCheckResult, userMessage: string) => ChatWithResultsInput
): Promise<string[]> {
    const logs: string[] = [];
    
    logs.push("--- Starting Chat Diagnostics ---");

    // Test 1: Data Formatting
    let formattedInput: ChatWithResultsInput | null = null;
    try {
        logs.push("[1/3] Formatting input data...");
        formattedInput = formatter(result, userMessage);
        logs.push("  [SUCCESS] Data formatted successfully.");
        logs.push("  Formatted Data:");
        logs.push(JSON.stringify(formattedInput, null, 2));
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        logs.push(`  [FAILURE] Failed to format data: ${error}`);
        logs.push("--- Diagnostics Aborted ---");
        return logs;
    }

    // Test 2: AI Flow Execution
    try {
        logs.push("\n[2/3] Calling the main AI chat flow (chatWithResults)...");
        const reply = await chatWithResults(formattedInput);
        logs.push("  [SUCCESS] AI flow executed.");
        logs.push("  AI Response:");
        logs.push(reply);
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        logs.push(`  [FAILURE] AI flow execution failed: ${error}`);
        logs.push("--- Diagnostics Aborted ---");
        return logs;
    }
    
    logs.push("\n[3/3] All diagnostics passed.");
    logs.push("--- Diagnostics Complete ---");

    return logs;
}
