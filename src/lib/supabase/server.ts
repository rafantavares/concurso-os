import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createLocalClient } from '@/lib/local-db/client'
import { Database } from '@/types/database'

export async function createClient(): Promise<any> {
  const cookieStore = await cookies()

  const isLocalMode = process.env.NEXT_PUBLIC_DATABASE_MODE === 'local' || !process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (isLocalMode) {
    return createLocalClient(cookieStore);
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
