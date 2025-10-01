'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

const authHiddenRoutes = new Set(['/login', '/register'])

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (isMounted) {
          setUser(user ?? null)
        }
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  if (pathname && authHiddenRoutes.has(pathname)) {
    return null
  }

  if (isChecking && !user) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" aria-hidden="true" />
            </div>
            <div className="flex items-center" aria-hidden="true">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" style={{ margin: '0 8px' }} />
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" style={{ margin: '0 8px' }} />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center" aria-label="ホーム">
            <img
              src="/buddhist-name-gene_logo_hori.png"
              alt="法名ジェネレーター"
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center">
            <Link href="/" className="nav-link font-semibold" style={{ margin: '0 8px' }}>
              ホーム
            </Link>
            {user ? (
              <>
                <Link href="/generate" className="nav-link font-semibold" style={{ margin: '0 8px' }}>
                  法名生成
                </Link>
                <Link href="/mypage" className="nav-link font-semibold" style={{ margin: '0 8px' }}>
                  マイページ
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-link font-semibold"
                  style={{ margin: '0 8px' }}
                  disabled={isChecking}
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link font-semibold" style={{ margin: '0 8px' }}>
                  ログイン
                </Link>
                <Link href="/register" className="nav-link font-semibold" style={{ margin: '0 8px' }}>
                  会員登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
