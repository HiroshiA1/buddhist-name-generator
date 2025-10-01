'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isPlaceholder = (v?: string | null) => !v || v === 'your_supabase_url' || v === 'your_supabase_anon_key'

let supabaseInstance: unknown

if (!isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)) {
  // Valid envs: real client
  supabaseInstance = createClient(supabaseUrl as string, supabaseAnonKey as string)
} else {
  // Dev-safe stub: prevents build/dev crash when envs are missing
  console.warn('[dev-stub] Using Supabase stub because env is missing or placeholder.')

  type User = { id: string } | null
  type Session = { user: User } | null

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

  supabaseInstance = {
    auth: {
      async getUser() {
        await delay(10)
        return { data: { user: { id: 'dev-user' } as User }, error: null }
      },
      onAuthStateChange(_cb: (_event: unknown, _session: Session) => void) {
        return { data: { subscription: { unsubscribe() {} } } }
      },
      async signOut() {
        await delay(10)
        return { error: null }
      },
    },
    functions: {
      async invoke(_name: string, _opts?: unknown) {
        await delay(50)
        return { data: { suggestions: [] }, error: null }
      },
    },
    from() {
      return {
        insert: async () => ({ data: null, error: null }),
      }
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = supabaseInstance as any
