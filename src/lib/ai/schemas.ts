import { z } from 'zod';

export const aiClassifySchema = z.object({
  summary: z.string(),
  classification: z.object({
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    sentiment: z.enum(['positive', 'neutral', 'negative', 'angry']),
    category_suggestion: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  suggestions: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high']),
});

export const aiSuggestResponseSchema = z.object({
  suggestedResponse: z.string(),
});

export const aiSummarizeSchema = z.object({
  summary: z.string(),
});

export type AIClassifyResponse = z.infer<typeof aiClassifySchema>;
export type AISuggestResponse = z.infer<typeof aiSuggestResponseSchema>;
export type AISummarizeResponse = z.infer<typeof aiSummarizeSchema>;
