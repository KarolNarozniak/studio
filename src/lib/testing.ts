// This is a new file: src/lib/testing.ts
'use server';

import type { TrustCheckResult } from './types';
import { chatWithResults, type ChatWithResultsInput } from '@/ai/flows/chat-with-results';

// The formatter function signature now matches the updated formatChatInput
type FormatterFn = (result: TrustCheckResult, userMessage: string) => ChatWithResultsInput;

export async function runChatDiagnostics(
    result: TrustCheckResult,
    userMessage: string,
    formatter: FormatterFn
): Promise<string[]> {
    const logs: string[] = [];
    
    logs.push("--- Starting Chat Diagnostics ---");

    // Test 1: Data Formatting
    let formattedInput: ChatWithResultsInput | null = null;
    try {
        logs.push("[1/3] Formatting input data...");
        formattedInput = formatter(result, userMessage);
        logs.push("  [SUCCESS] Data formatted successfully.");
        logs.push("  Formatted Data for AI:");
        // Use JSON.stringify to clearly show the final object being sent
        logs.push(JSON.stringify(formattedInput, null, 2)); 
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
        aiResponse = await chatWithResults(formattedInput);
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
    if (aiResponse && !aiResponse.includes("I'm sorry")) {
        logs.push("  [SUCCESS] AI provided a valid, content-rich response.");
        logs.push("--- Diagnostics Complete: All tests passed! ---");
    } else {
        logs.push("  [FAILURE] AI returned a generic or empty response.");
        logs.push("--- Diagnostics Complete: Validation failed. ---");
    }


    return logs;
}
