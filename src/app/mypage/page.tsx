'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { exportToPDF } from '@/lib/pdfExport'
import { ERROR_MESSAGES } from '@/lib/constants'
import { logSupabaseError } from '@/lib/errorHandling'
import type { GenerationHistoryItem } from '@/types'


export default function MyPage() {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleExportPDF = async (item: GenerationHistoryItem) => {
    const exportData = {
      firstName: item.input_data.firstName,
      gender: item.input_data.gender,
      hasIngo: item.input_data.hasIngo,
      hobbies: item.input_data.hobbies,
      skills: item.input_data.skills,
      personality: item.input_data.personality,
      customCharacter: item.input_data.customCharacter,
      generatedNames: item.generated_names,
      createdAt: new Date(item.created_at).toLocaleString('ja-JP')
    }

    try {
      await exportToPDF(exportData)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('PDF出力エラー:', error)
      }
      alert(ERROR_MESSAGES.PDF_EXPORT_ERROR)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 履歴の取得
      const { data: historyData, error: historyError } = await supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (historyError) {
        logSupabaseError('履歴取得', historyError)
      } else {
        setHistory(historyData || [])
      }

      setLoading(false)
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', padding: 'var(--s-8) 0' }}>
      <div className="container">
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 className="h1 text-center" style={{ marginBottom: 'var(--s-12)' }}>マイページ</h1>

          {history.length === 0 ? (
            <div className="card text-center" style={{ padding: 'var(--s-12)' }}>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-8)' }}>まだ生成履歴がありません。</p>
              <div style={{ marginTop: 'var(--s-6)' }}>
                <Link href="/generate" className="btn btn-primary">法名を生成する</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {history.map((item) => (
                <div key={item.id} className="card" style={{ padding: 'var(--s-8)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--s-6)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                      生成日時: {new Date(item.created_at).toLocaleString()}
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleExportPDF(item)}
                      style={{ 
                        fontSize: 'var(--fs-sm)',
                        padding: 'var(--s-2) var(--s-4)',
                        minHeight: '36px'
                      }}
                    >
                      📄 PDF
                    </button>
                  </div>
                  
                  <h3 className="h3" style={{ marginBottom: 'var(--s-6)' }}>入力情報</h3>
                  <div className="space-y-2" style={{ marginBottom: 'var(--s-8)', color: 'var(--text-secondary)' }}>
                    <div><strong>俗名:</strong> {item.input_data.firstName}</div>
                    <div><strong>性別:</strong> {item.input_data.gender === 'male' ? '男性' : '女性'}</div>
                    <div><strong>院号の有無:</strong> {item.input_data.hasIngo ? 'あり（自動生成）' : 'なし'}</div>
                    {item.input_data.hobbies && item.input_data.hobbies.length > 0 && (
                      <div><strong>趣味:</strong> {item.input_data.hobbies.join(', ')}</div>
                    )}
                    {item.input_data.skills && item.input_data.skills.length > 0 && (
                      <div><strong>仕事・職業:</strong> {item.input_data.skills.join(', ')}</div>
                    )}
                    <div><strong>人柄:</strong> {item.input_data.personality.substring(0, 100)}{item.input_data.personality.length > 100 ? '...' : ''}</div>
                    {item.input_data.customCharacter && (
                      <div><strong>俗名から含めた漢字:</strong> {item.input_data.customCharacter}</div>
                    )}
                  </div>

                  <h3 className="h3" style={{ marginBottom: 'var(--s-6)' }}>生成された法名案</h3>
                  <div className="space-y-6">
                    {item.generated_names.map((suggestion, idx) => (
                      <div key={idx} className="result-card">
                        <h4 className="result-title">{suggestion.name} ({suggestion.reading})</h4>
                        <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
                          <p><strong>意味:</strong> {suggestion.meaning}</p>
                          <p><strong>選定理由:</strong> {suggestion.reasoning}</p>
                          <p><strong>仏教的背景:</strong> {suggestion.buddhistContext}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
