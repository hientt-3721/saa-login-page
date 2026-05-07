import type { Session as SupabaseSession, User } from '@supabase/supabase-js';

export type Session = SupabaseSession;

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export type AuthError = 'unauthorized' | 'session_expired' | 'oauth_failed' | 'popup_blocked';

export function mapUserToProfile(user: User): UserProfile {
  return {
    userId: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.['full_name'] ?? user.user_metadata?.['name'] ?? '',
    avatarUrl: user.user_metadata?.['avatar_url'] ?? null,
  };
}
