import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/services/auth-service';
import LoginPage from '@/components/login/login-page';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPageRoute({ searchParams }: LoginPageProps): Promise<ReactNode> {
  const supabase = await createServerClient();
  const { user } = await getUser(supabase);

  if (user) {
    redirect('/');
  }

  const params = await searchParams;
  const error = params.error;
  const validErrors = ['unauthorized', 'session_expired', 'oauth_failed', 'popup_blocked'];
  const initialError = error && validErrors.includes(error) ? error : undefined;

  return <LoginPage initialError={initialError} />;
}
