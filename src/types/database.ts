// Auto-generated types based on Supabase schema
// These types match the database structure defined in supabase/migrations/01_schema.sql

export type UserRole = 'admin' | 'agent' | 'user';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketSentiment = 'positive' | 'neutral' | 'negative' | 'angry';

// Profile (extends auth.users)
export interface Profile {
  id: string; // UUID from auth.users
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Ticket
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  sentiment: TicketSentiment | null;
  category_id: string | null;
  created_by: string;
  assigned_to: string | null;
  ai_summary: string | null;
  ai_suggested_response: string | null;
  ai_risk_level: string | null;
  ai_classification: AIClassification | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

// Ticket with relations
export interface TicketWithRelations extends Ticket {
  profiles?: Profile; // created_by
  agent?: Profile; // assigned_to
  category?: Category;
  comments?: Comment[];
}

// Comment
export interface Comment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  is_ai_generated: boolean;
  created_at: string;
}

// Comment with relations
export interface CommentWithRelations extends Comment {
  author?: Profile;
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  ticket_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// AI Log
export interface AILog {
  id: string;
  ticket_id: string;
  prompt: string;
  model_version: string;
  response: AIResponse;
  latency_ms: number | null;
  token_count: number | null;
  created_at: string;
}

// AI-related types
export interface AIClassification {
  summary: string;
  classification: {
    priority: TicketPriority;
    sentiment: TicketSentiment;
    category_suggestion: string;
    confidence: number;
  };
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AIResponse {
  summary?: string;
  classification?: {
    priority: TicketPriority;
    sentiment: TicketSentiment;
    category_suggestion: string;
    confidence: number;
  };
  suggestions?: string[];
  riskLevel?: string;
  suggestedResponse?: string;
  nextAction?: string;
}

// Request/Response DTOs
export interface CreateTicketRequest {
  title: string;
  description: string;
  category_id?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string | null;
  category_id?: string | null;
}

export interface CreateCommentRequest {
  content: string;
  is_ai_generated?: boolean;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}
