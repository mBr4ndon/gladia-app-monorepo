import { getRequestConfig } from 'next-intl/server';
import { auth } from '@gladia-app/auth/server';
import { getProfileWithMembershipsById } from '@gladia-app/db/queries';
import { headers } from 'next/headers';

const FALLBACK_LOCALE = 'en';

export default getRequestConfig(async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    let locale = FALLBACK_LOCALE;

    if (session?.user?.id) {
        const profile = await getProfileWithMembershipsById(session.user.id);
        const profileLocale = profile?.profile.language;

        if (profileLocale && typeof profileLocale === 'string') {
            locale = profileLocale;
        }
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
