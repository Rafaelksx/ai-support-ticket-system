import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// Provider-agnostic AI client
// ---------------------------------------------------------------------------
// Supports two providers via environment variables:
//
//   • Gemini (recommended — free tier available):
//       GEMINI_API_KEY=your-gemini-key
//       OPENAI_MODEL=gemini-2.0-flash   (or gemini-1.5-pro, etc.)
//
//   • OpenAI (original):
//       OPENAI_API_KEY=sk-proj-...
//       OPENAI_MODEL=gpt-4o-mini
//
// No other file needs to change — the same OpenAI SDK is used for both,
// because Google exposes Gemini through an OpenAI-compatible REST endpoint.
// ---------------------------------------------------------------------------

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      // Use Gemini via its OpenAI-compatible endpoint
      _openai = new OpenAI({
        apiKey: geminiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      });
    } else if (openaiKey) {
      // Use OpenAI directly
      _openai = new OpenAI({ apiKey: openaiKey });
    } else {
      throw new Error(
        'No AI provider configured. Set either GEMINI_API_KEY or OPENAI_API_KEY in your .env.local'
      );
    }
  }
  return _openai;
}

// Named export for backwards compatibility — all existing code keeps working
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop];
  },
});
