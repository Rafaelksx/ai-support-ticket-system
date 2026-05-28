import OpenAI from 'openai';

// Lazy singleton — only instantiated on first actual use (not at build time).
// This prevents Next.js build from crashing when OPENAI_API_KEY is not present
// in the build environment (it is only needed at runtime).
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Keep a named export for backwards compatibility
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop];
  },
});
