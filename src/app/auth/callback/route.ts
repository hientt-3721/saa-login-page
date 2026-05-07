import { redirect } from 'next/navigation';
import { z } from 'zod';
import { type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { validateEmailDomain } from '@/services/auth-service';

const callbackSchema = z.object({
  code: z.string().min(1).optional(),
  next: z.string().optional(),
});

function isSafeRedirect(next: string | undefined): next is string {
  if (!next) return false;
  // Only allow relative paths (no protocol, no double-slash start)
  return next.startsWith('/') && !next.startsWith('//');
}

export async function GET(request: NextRequest): Promise<never> {
  const { searchParams } = request.nextUrl;

  const parsed = callbackSchema.safeParse({
    code: searchParams.get('code') ?? undefined,
    next: searchParams.get('next') ?? undefined,
  });

  if (!parsed.success || !parsed.data.code) {
    redirect('/login?error=session_expired');
  }

  const { code, next } = parsed.data;
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    redirect('/login?error=session_expired');
  }

  const email = data.session.user.email ?? '';
  const allowedDomain = env.ALLOWED_EMAIL_DOMAIN;

  if (!validateEmailDomain(email, allowedDomain)) {
    redirect('/login?error=unauthorized');
  }

  const safeNext = isSafeRedirect(next) ? next : '/';
  redirect(safeNext);
}
