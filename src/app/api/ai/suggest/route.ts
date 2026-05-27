import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/ai/openai';
import { PROMPTS } from '@/lib/ai/prompts';
import { aiSuggestResponseSchema } from '@/lib/ai/schemas';
import { logAIRequest } from '@/lib/ai/logger';

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
      .select('*, categories(name), profiles:created_by(full_name)')
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

    // 2. Format discussion history
    let discussionHistory = `Descripción inicial del ticket por ${ticket.profiles?.full_name || 'Usuario'}:\n"${ticket.description}"\n\n`;

    if (comments && comments.length > 0) {
      discussionHistory += `Historial de comentarios:\n`;
      comments.forEach((c: any) => {
        const roleLabel = c.author?.role === 'user' ? 'Usuario' : 'Agente';
        discussionHistory += `[${roleLabel}] ${c.author?.full_name}: "${c.content}"\n`;
      });
    } else {
      discussionHistory += `No hay comentarios previos en este ticket.\n`;
    }

    const promptInput = `
ID del Ticket: ${ticket.id}
Título: ${ticket.title}
Categoría: ${ticket.categories?.name || 'Ninguna'}
Prioridad: ${ticket.priority}
Sentimiento: ${ticket.sentiment || 'Desconocido'}

Historial de Discusión:
${discussionHistory}
    `;

    const model = process.env.OPENAI_MODEL_ADVANCED || 'gpt-4o';

    // 3. Invoke OpenAI (using more advanced model for reply writing)
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: PROMPTS.SUGGEST_RESPONSE.system },
        { role: 'user', content: promptInput }
      ],
      response_format: { type: 'json_object' }
    });

    const latencyMs = Date.now() - startTime;
    const aiText = response.choices[0].message.content || '{}';
    const parsedData = JSON.parse(aiText);

    // 4. Validate output with Zod
    const validatedData = aiSuggestResponseSchema.parse(parsedData);
    const tokenCount = response.usage?.total_tokens || 0;

    // 5. Update suggested response in the ticket
    await supabase
      .from('tickets')
      .update({
        ai_suggested_response: validatedData.suggestedResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    // 6. Log AI Request
    await logAIRequest({
      ticketId,
      prompt: promptInput,
      modelVersion: model,
      response: validatedData,
      latencyMs,
      tokenCount
    });

    return NextResponse.json({ success: true, suggestedResponse: validatedData.suggestedResponse });
  } catch (error: any) {
    console.error('AI suggest response error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during AI suggestion generation' },
      { status: 500 }
    );
  }
}
