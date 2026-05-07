import type { SupabaseClient, Session, User, AuthError } from '@supabase/supabase-js';

export interface SignInResult {
  error: AuthError | null;
}

export interface SessionResult {
  session: Session | null;
  error: AuthError | null;
}

export interface UserResult {
  user: User | null;
  error: AuthError | null;
}

export async function signInWithGoogle(
  client: SupabaseClient,
  redirectTo: string,
): Promise<SignInResult> {
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });

  return { error };
}

export async function getSession(client: SupabaseClient): Promise<SessionResult> {
  const { data, error } = await client.auth.getSession();
  return { session: data.session, error };
}

/**
 * Validates the JWT on the server. Prefer this over getSession() in Server Components
 * and middleware because it revalidates the token with the Supabase Auth server.
 */
export async function getUser(client: SupabaseClient): Promise<UserResult> {
  const { data, error } = await client.auth.getUser();
  return { user: data.user, error };
}

export function validateEmailDomain(email: string, allowedDomain: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1];
  return domain === allowedDomain;
}
