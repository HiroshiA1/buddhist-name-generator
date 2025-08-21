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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <img 
              src="/buddhist-name-gene_logo_hori.png" 
              alt="法名ジェネレーター" 
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center">
            <Link href="/" className="nav-link font-semibold" style={{ margin: '0 8px' }}>ホーム</Link>
            {user ? (
              <>
                <Link href="/generate" className="nav-link font-semibold" style={{ margin: '0 8px' }}>法名生成</Link>
                <Link href="/mypage" className="nav-link font-semibold" style={{ margin: '0 8px' }}>マイページ</Link>
                <button onClick={handleLogout} className="nav-link font-semibold" style={{ margin: '0 8px' }}>ログアウト</button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link font-semibold" style={{ margin: '0 8px' }}>ログイン</Link>
                <Link href="/register" className="nav-link font-semibold" style={{ margin: '0 8px' }}>会員登録</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}