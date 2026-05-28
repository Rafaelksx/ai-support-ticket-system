import OpenAI from 'openai';

// Initialize the OpenAI client.
// Note: This must only be run server-side (API Routes, Server Actions, Server Components)
// because it relies on the private process.env.OPENAI_API_KEY.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_to_allow_ui_render_without_crashing',
});
