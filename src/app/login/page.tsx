'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        let errorMessage = 'ログインに失敗しました。'
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません。'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスが確認されていません。メールをご確認ください。'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'ログイン試行回数が多すぎます。しばらく時間をおいてからお試しください。'
        }
        
        alert(errorMessage)
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
      alert('予期しないエラーが発生しました。しばらく時間をおいてからお試しください。')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)', padding: 'var(--s-6)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="h2 text-center" style={{ marginBottom: 'var(--s-8)' }}>ログイン</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="form-group">
            <label htmlFor="email" className="form-label">メールアドレス</label>
            <input
              type="email"
              id="email"
              className="input"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">パスワード</label>
            <input
              type="password"
              id="password"
              className="input"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 'var(--s-8)' }}>
            <button
              type="submit"
              className="btn btn-primary"
            >
              ログイン
            </button>
            <a href="/register" className="nav-link" style={{ minHeight: 'auto' }}>
              新規登録はこちら
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}