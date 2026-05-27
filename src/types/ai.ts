import { TicketPriority, TicketSentiment } from './database';

// Request types for AI endpoints
export interface ClassifyRequest {
  ticketId: string;
  title: string;
  description: string;
  category?: string;
}

export interface SummarizeRequest {
  ticketId: string;
  title: string;
  description: string;
  comments?: Array<{
    content: string;
    author_role: string;
    created_at: string;
  }>;
}

export interface SuggestResponseRequest {
  ticketId: string;
  title: string;
  description: string;
  category?: string;
  sentiment?: TicketSentiment;
  comments?: Array<{
    content: string;
    author_role: string;
    created_at: string;
  }>;
  tone?: 'professional' | 'casual' | 'empathetic';
}

export interface RiskAssessmentRequest {
  ticketId: string;
  title: string;
  description: string;
  sentiment: TicketSentiment | null;
  time_open_hours: number;
  interaction_count: number;
  priority: TicketPriority;
}

export interface NextActionRequest {
  ticketId: string;
  title: string;
  description: string;
  current_status: string;
  priority: TicketPriority;
  sentiment: TicketSentiment | null;
  interaction_count: number;
  last_comment_from?: 'user' | 'agent';
}

// Response types for AI endpoints
export interface ClassifyResponse {
  summary: string;
  classification: {
    priority: TicketPriority;
    sentiment: TicketSentiment;
    category_suggestion: string;
    confidence: number; // 0.0 - 1.0
  };
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SummarizeResponse {
  summary: string;
  key_points: string[];
  latest_status: string;
}

export interface SuggestResponseResponse {
  suggested_response: string;
  tone: string;
  closing_statement: string;
}

export interface RiskAssessmentResponse {
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number; // 0.0 - 1.0
  risk_factors: string[];
  recommended_action: 'monitor' | 'escalate' | 'prioritize' | 'resolve_urgently';
  reasoning: string;
}

export interface NextActionResponse {
  recommended_action: 'assign_to_specialist' | 'request_more_info' | 'escalate' | 'close' | 'send_update' | 'provide_workaround';
  reasoning: string;
  estimated_impact: string;
}

// API Response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    model_version?: string;
    latency_ms?: number;
    tokens_used?: number;
  };
}

// AI Log types
export interface AILogEntry {
  ticket_id: string;
  endpoint: 'classify' | 'summarize' | 'suggest' | 'risk' | 'next_action';
  prompt: string;
  model_version: string;
  response: unknown;
  latency_ms: number;
  token_count: number;
  success: boolean;
  error?: string;
}

// Prompt templates
export interface PromptTemplate {
  version: string;
  system: string;
  user: string;
  model: 'gpt-4o' | 'gpt-4o-mini';
  temperature?: number;
  max_tokens?: number;
}

export interface PromptConfig {
  CLASSIFY_V1: PromptTemplate;
  SUMMARIZE_V1: PromptTemplate;
  SUGGEST_RESPONSE_V1: PromptTemplate;
  RISK_ASSESSMENT_V1: PromptTemplate;
  NEXT_ACTION_V1: PromptTemplate;
}
