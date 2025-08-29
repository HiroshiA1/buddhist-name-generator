'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navigation() {
  const [user, setUser] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (loading || isAuthPage) return null

  return (
    <nav className="header">
      <div className="container">
        <div className="flex justify-between items-center" style={{ minHeight: '64px' }}>
          <Link href="/" className="flex items-center">
            <img 
              src="/buddhist-name-gene_logo_hori.png" 
              alt="法名ジェネレーター" 
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center nav-container">
            <Link href="/" className="nav-link">ホーム</Link>
            {user ? (
              <>
                <Link href="/generate" className="nav-link">法名生成</Link>
                <Link href="/mypage" className="nav-link">マイページ</Link>
                <button onClick={handleLogout} className="nav-link">ログアウト</button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">ログイン</Link>
                <Link href="/register" className="nav-link">会員登録</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}