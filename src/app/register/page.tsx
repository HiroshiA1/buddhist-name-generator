'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })
      
      if (error) {
        console.error('Registration error:', error)
        
        let errorMessage = '登録に失敗しました。'
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'このメールアドレスは既に登録されています。ログインページからログインしてください。'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '有効なメールアドレスを入力してください。'
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'パスワードは8文字以上で入力してください。'
        } else if (error.message.includes('Signup is disabled')) {
          errorMessage = '現在新規登録を停止しています。しばらくしてからお試しください。'
        }
        
        alert(errorMessage)
      } else if (data?.user) {
        alert('登録が完了しました。メールアドレスを確認してください。')
        router.push('/login')
      } else {
        alert('登録に失敗しました。もう一度お試しください。')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('予期しないエラーが発生しました。')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)', padding: 'var(--s-6)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="h2 text-center" style={{ marginBottom: 'var(--s-8)' }}>新規会員登録</h2>
        <form onSubmit={handleRegister} className="space-y-6">
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
              placeholder="8文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="help-text">パスワードは8文字以上で設定してください</p>
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 'var(--s-8)' }}>
            <button
              type="submit"
              className="btn btn-primary"
            >
              登録
            </button>
            <a href="/login" className="nav-link" style={{ minHeight: 'auto' }}>
              ログインはこちら
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
