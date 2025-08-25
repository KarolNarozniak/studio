import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-trust-check-results.ts';
import '@/ai/flows/chat-with-results.ts';
import '@/ai/flows/detect-typosquatting.ts';
