import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/ai/openai';
import { PROMPTS } from '@/lib/ai/prompts';
import { aiClassifySchema } from '@/lib/ai/schemas';
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

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
    }

    // 1. Fetch ticket details from database
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, categories(name), profiles:created_by(full_name)')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 2. Prepare structured input for AI
    const promptInput = `
ID del Ticket: ${ticket.id}
Título: ${ticket.title}
Descripción: ${ticket.description}
Categoría Actual: ${ticket.categories?.name || 'Ninguna'}
Creado por: ${ticket.profiles?.full_name || 'Desconocido'}
    `;

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // 3. Invoke OpenAI
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: PROMPTS.CLASSIFY.system },
        { role: 'user', content: promptInput }
      ],
      // Note: response_format is omitted — Gemini doesn't support json_object.
      // The system prompt already instructs the model to respond in strict JSON.
    });

    const latencyMs = Date.now() - startTime;
    const aiText = response.choices[0].message.content || '{}';
    const parsedData = JSON.parse(aiText);

    // 4. Validate output with Zod
    const validatedData = aiClassifySchema.parse(parsedData);
    const tokenCount = response.usage?.total_tokens || 0;

    // 5. Update Ticket in Supabase
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        ai_summary: validatedData.summary,
        priority: validatedData.classification.priority,
        sentiment: validatedData.classification.sentiment,
        ai_risk_level: validatedData.riskLevel,
        ai_classification: validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (updateError) {
      console.error('Error updating ticket with AI classification:', updateError);
    }

    // 6. Log the AI Request for Observability
    await logAIRequest({
      ticketId,
      prompt: promptInput,
      modelVersion: model,
      response: validatedData,
      latencyMs,
      tokenCount
    });

    // 7. Automation connection: Trigger n8n webhook if priority is high/critical
    const isHighPriority = ['high', 'critical'].includes(validatedData.classification.priority);
    const isHighRisk = validatedData.riskLevel === 'high';
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_HIGH_PRIORITY;

    if ((isHighPriority || isHighRisk) && n8nWebhookUrl) {
      // Execute non-blocking webhook request
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ticket.escalated',
          ticket: {
            id: ticket.id,
            title: ticket.title,
            priority: validatedData.classification.priority,
            sentiment: validatedData.classification.sentiment,
            riskLevel: validatedData.riskLevel,
            summary: validatedData.summary,
            creator_email: user.email
          }
        })
      }).catch(err => console.error('Failed to trigger n8n priority webhook:', err));
    }

    return NextResponse.json({ success: true, data: validatedData });
  } catch (error: any) {
    console.error('AI Triage error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during AI classification' },
      { status: 500 }
    );
  }
}
