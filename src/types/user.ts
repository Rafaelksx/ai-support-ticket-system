import { Profile, UserRole } from './database';

export type { Profile, UserRole };

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  aud?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CurrentUser extends Profile {
  can_manage_users?: boolean;
  can_manage_categories?: boolean;
  can_view_all_tickets?: boolean;
  can_assign_tickets?: boolean;
}

export interface UserWithStats extends Profile {
  created_tickets_count?: number;
  assigned_tickets_count?: number;
  resolved_tickets_count?: number;
}

// Role-based permissions
export interface RolePermissions {
  view_own_tickets: boolean;
  view_all_tickets: boolean;
  create_ticket: boolean;
  update_ticket: boolean;
  delete_ticket: boolean;
  assign_ticket: boolean;
  manage_users: boolean;
  manage_categories: boolean;
  view_analytics: boolean;
  access_ai_features: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    view_own_tickets: true,
    view_all_tickets: false,
    create_ticket: true,
    update_ticket: false,
    delete_ticket: false,
    assign_ticket: false,
    manage_users: false,
    manage_categories: false,
    view_analytics: false,
    access_ai_features: false,
  },
  agent: {
    view_own_tickets: true,
    view_all_tickets: true,
    create_ticket: true,
    update_ticket: true,
    delete_ticket: false,
    assign_ticket: true,
    manage_users: false,
    manage_categories: false,
    view_analytics: true,
    access_ai_features: true,
  },
  admin: {
    view_own_tickets: true,
    view_all_tickets: true,
    create_ticket: true,
    update_ticket: true,
    delete_ticket: true,
    assign_ticket: true,
    manage_users: true,
    manage_categories: true,
    view_analytics: true,
    access_ai_features: true,
  },
};
