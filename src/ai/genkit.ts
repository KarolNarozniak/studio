import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const geminiFlash = googleAI.model('gemini-2.0-flash');

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
