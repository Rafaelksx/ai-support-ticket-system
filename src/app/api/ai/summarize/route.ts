import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/ai/openai';
import { PROMPTS } from '@/lib/ai/prompts';
import { aiSummarizeSchema } from '@/lib/ai/schemas';
import { logAIRequest } from '@/lib/ai/logger';
import { parseAIJson } from '@/lib/ai/utils';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is Agent or Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['agent', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Agents and Admins only' }, { status: 403 });
    }

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
    }

    // 1. Fetch ticket and comments
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, profiles:created_by(full_name)')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*, author:profiles(full_name, role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }

    // 2. Prepare discussion text for AI
    let discussionHistory = `Descripción inicial por ${ticket.profiles?.full_name || 'Usuario'}:\n"${ticket.description}"\n\n`;

    if (comments && comments.length > 0) {
      discussionHistory += `Conversación:\n`;
      comments.forEach((c: any) => {
        const roleLabel = c.author?.role === 'user' ? 'Usuario' : 'Agente';
        discussionHistory += `[${roleLabel}] ${c.author?.full_name}: "${c.content}"\n`;
      });
    }

    const promptInput = `
Título del Ticket: ${ticket.title}
Historial del Ticket:
${discussionHistory}
    `;

    const model = process.env.OPENAI_MODEL || 'gemini-1.5-flash';

    // 3. Invoke OpenAI
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: PROMPTS.SUMMARIZE.system },
        { role: 'user', content: promptInput }
      ],
      // response_format omitted — not supported by Gemini. Prompt drives JSON output.
    });

    const latencyMs = Date.now() - startTime;
    const aiText = response.choices[0].message.content;
    const parsedData = parseAIJson(aiText);

    // 4. Validate output with Zod
    const validatedData = aiSummarizeSchema.parse(parsedData);
    const tokenCount = response.usage?.total_tokens || 0;

    // 5. Update Ticket ai_summary in Supabase
    await supabase
      .from('tickets')
      .update({
        ai_summary: validatedData.summary,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    // 6. Log request
    await logAIRequest({
      ticketId,
      prompt: promptInput,
      modelVersion: model,
      response: validatedData,
      latencyMs,
      tokenCount
    });

    return NextResponse.json({ success: true, summary: validatedData.summary });
  } catch (error: any) {
    // Log full error details for debugging
    console.error('AI summarize error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      cause: error?.cause,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
    });

    // Surface the real error message so we can diagnose it
    const detail = error?.error?.message   // Gemini/OpenAI SDK error payload
      ?? error?.message
      ?? 'An error occurred during AI summary generation';

    return NextResponse.json(
      { error: detail, type: error?.type ?? 'UNKNOWN', status: error?.status ?? 500 },
      { status: 500 }
    );
  }
}
