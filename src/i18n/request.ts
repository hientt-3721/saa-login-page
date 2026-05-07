import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = localeCookie?.value === 'en' ? 'en' : 'vi';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      if (error.code !== 'MISSING_MESSAGE') {
        throw error;
      }
      // silently fall back — missing keys return undefined, caller uses fallback
    },
    getMessageFallback({ key }) {
      return key;
    },
  };
});
