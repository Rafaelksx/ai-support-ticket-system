import { createClient } from '../supabase/server';

interface LogAIParams {
  ticketId: string;
  prompt: string;
  modelVersion: string;
  response: any;
  latencyMs: number;
  tokenCount?: number;
}

export async function logAIRequest({
  ticketId,
  prompt,
  modelVersion,
  response,
  latencyMs,
  tokenCount
}: LogAIParams) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('ai_logs').insert({
      ticket_id: ticketId,
      prompt,
      model_version: modelVersion,
      response,
      latency_ms: latencyMs,
      token_count: tokenCount || 0
    });

    if (error) {
      console.error('Error saving AI log to database:', error);
    }
  } catch (err) {
    console.error('Failed to log AI request:', err);
  }
}
