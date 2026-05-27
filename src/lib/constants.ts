import { TicketStatus, TicketPriority, TicketSentiment, UserRole } from '@/types/database';

// Status labels and colors
export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: string }> = {
  open: { label: 'Abierto', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
  in_progress: { label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: '🟢' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800', icon: '⚫' },
};

// Priority labels and colors
export const TICKET_PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; level: number }> = {
  low: { label: 'Baja', color: 'bg-green-100 text-green-800', level: 1 },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800', level: 2 },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800', level: 3 },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-800', level: 4 },
};

// Sentiment labels and colors
export const TICKET_SENTIMENT_CONFIG: Record<TicketSentiment, { label: string; color: string; emoji: string }> = {
  positive: { label: 'Positivo', color: 'bg-green-100 text-green-800', emoji: '😊' },
  neutral: { label: 'Neutral', color: 'bg-gray-100 text-gray-800', emoji: '😐' },
  negative: { label: 'Negativo', color: 'bg-orange-100 text-orange-800', emoji: '😕' },
  angry: { label: 'Enojado', color: 'bg-red-100 text-red-800', emoji: '😠' },
};

// Role labels
export const USER_ROLE_CONFIG: Record<UserRole, { label: string; description: string }> = {
  user: {
    label: 'Usuario',
    description: 'Puede crear y ver sus propios tickets',
  },
  agent: {
    label: 'Agente',
    description: 'Puede ver todos los tickets y atenderlos, acceso a IA',
  },
  admin: {
    label: 'Administrador',
    description: 'Acceso completo a la plataforma',
  },
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  TICKET_LIMITS: [10, 25, 50],
};

// Date formats
export const DATE_FORMAT = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  FULL: 'EEEE, dd MMMM yyyy HH:mm',
};

// AI Configuration
export const AI_CONFIG = {
  MODELS: {
    CLASSIFY: process.env.OPENAI_MODEL_CLASSIFY || 'gpt-4o-mini',
    SUMMARIZE: process.env.OPENAI_MODEL_SUMMARIZE || 'gpt-4o-mini',
    SUGGEST: process.env.OPENAI_MODEL_SUGGEST || 'gpt-4o',
    RISK: process.env.OPENAI_MODEL_RISK || 'gpt-4o-mini',
    NEXT_ACTION: process.env.OPENAI_MODEL_NEXT_ACTION || 'gpt-4o-mini',
  },
  TEMPERATURE: {
    CLASSIFY: 0.3,
    SUMMARIZE: 0.5,
    SUGGEST: 0.7,
    RISK: 0.3,
    NEXT_ACTION: 0.5,
  },
  MAX_TOKENS: {
    CLASSIFY: 500,
    SUMMARIZE: 300,
    SUGGEST: 400,
    RISK: 200,
    NEXT_ACTION: 200,
  },
};

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'No encontrado',
  INVALID_REQUEST: 'Solicitud inválida',
  DATABASE_ERROR: 'Error de base de datos',
  AI_ERROR: 'Error de IA',
  VALIDATION_ERROR: 'Error de validación',
};

// Success messages
export const SUCCESS_MESSAGES = {
  TICKET_CREATED: 'Ticket creado exitosamente',
  TICKET_UPDATED: 'Ticket actualizado exitosamente',
  TICKET_DELETED: 'Ticket eliminado exitosamente',
  COMMENT_CREATED: 'Comentario agregado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
};

// API Routes
export const API_ROUTES = {
  TICKETS: {
    LIST: '/api/tickets',
    CREATE: '/api/tickets',
    DETAIL: (id: string) => `/api/tickets/${id}`,
    UPDATE: (id: string) => `/api/tickets/${id}`,
    DELETE: (id: string) => `/api/tickets/${id}`,
    COMMENTS: (id: string) => `/api/tickets/${id}/comments`,
  },
  AI: {
    CLASSIFY: '/api/ai/classify',
    SUMMARIZE: '/api/ai/summarize',
    SUGGEST: '/api/ai/suggest',
    RISK: '/api/ai/risk',
    NEXT_ACTION: '/api/ai/next-action',
  },
  USERS: {
    LIST: '/api/users',
    UPDATE_ROLE: (id: string) => `/api/users/${id}/role`,
  },
  CATEGORIES: {
    LIST: '/api/categories',
    CREATE: '/api/categories',
    UPDATE: (id: string) => `/api/categories/${id}`,
    DELETE: (id: string) => `/api/categories/${id}`,
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
  },
};

// Feature flags
export const FEATURES = {
  AI_ENABLED: process.env.ENABLE_AI_FEATURES !== 'false',
  AUTOMATIONS_ENABLED: process.env.ENABLE_AUTOMATIONS !== 'false',
  EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
  SLACK_NOTIFICATIONS: process.env.ENABLE_SLACK_NOTIFICATIONS !== 'false',
};
