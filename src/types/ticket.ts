import { Ticket, TicketWithRelations, TicketStatus, TicketPriority, TicketSentiment, Comment, CommentWithRelations } from './database';

export type { Ticket, TicketWithRelations, TicketStatus, TicketPriority, TicketSentiment, Comment, CommentWithRelations };

// Extended ticket types with computed properties
export interface TicketListItem {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  sentiment: TicketSentiment | null;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  agent_name?: string | null;
  category_name?: string | null;
  comment_count?: number;
}

export interface TicketDetailView extends TicketWithRelations {
  comment_count?: number;
  time_open?: string; // formatted
  time_since_update?: string; // formatted
}

// Filter and sort types
export interface TicketFilters {
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority | TicketPriority[];
  assigned_to?: string | 'unassigned';
  category_id?: string;
  created_by?: string;
  search?: string; // search in title and description
}

export interface TicketSort {
  field: 'created_at' | 'updated_at' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

export interface TicketPaginationParams {
  page: number;
  limit: number;
  filters?: TicketFilters;
  sort?: TicketSort;
}

export interface TicketPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Statistics
export interface TicketStatistics {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  by_sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    angry: number;
  };
  average_resolution_time_hours?: number;
  avg_response_time_hours?: number;
}

// Agent-specific statistics
export interface AgentStatistics {
  agent_id: string;
  agent_name: string;
  assigned_count: number;
  resolved_count: number;
  open_count: number;
  average_resolution_time_hours: number;
  satisfaction_score?: number;
}
