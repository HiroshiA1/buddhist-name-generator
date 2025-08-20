'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { exportToPDF } from '@/lib/pdfExport'

interface GenerationHistoryItem {
  id: string;
  input_data: {
    firstName: string;
    gender: 'male' | 'female';
    hasIngo: boolean;
    hobbies: string[];
    skills: string[];
    personality: string;
    customCharacter?: string;
  };
  generated_names: Array<{
    name: string;
    reading: string;
    meaning: string;
    reasoning: string;
    buddhistContext: string;
  }>;
  is_favorited: boolean;
  created_at: string;
}


export default function MyPage() {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleExportPDF = (item: GenerationHistoryItem) => {

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

    exportToPDF(exportData)
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
        console.error('履歴の取得エラー:', historyError.message)
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
    <div className="min-h-screen" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="container">
        <div className="card fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 className="h2 text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>マイページ</h2>


          {history.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--spacing-2xl)', color: 'var(--color-text-secondary)' }}>
              <p>まだ生成履歴がありません。</p>
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <Link href="/generate" className="btn btn-primary">法名を生成する</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {history.map((item) => (
                <div key={item.id} className="card" style={{ padding: 'var(--spacing-xl)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      生成日時: {new Date(item.created_at).toLocaleString()}
                    </div>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleExportPDF(item)}
                      style={{ 
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.5rem'
                      }}
                    >
                      📄 PDF
                    </button>
                  </div>
                  
                  <h3 className="h3" style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-charcoal)' }}>入力情報</h3>
                  <div className="space-y-2" style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
                    <div><strong>俗名:</strong> {item.input_data.firstName}</div>
                    <div><strong>性別:</strong> {item.input_data.gender === 'male' ? '男性' : '女性'}</div>
                    <div><strong>院号の有無:</strong> {item.input_data.hasIngo ? 'あり（自動生成）' : 'なし'}</div>
                    {item.input_data.hobbies && item.input_data.hobbies.length > 0 && (
                      <div><strong>趣味:</strong> {item.input_data.hobbies.join(', ')}</div>
                    )}
                    {item.input_data.skills && item.input_data.skills.length > 0 && (
                      <div><strong>特技:</strong> {item.input_data.skills.join(', ')}</div>
                    )}
                    <div><strong>人柄:</strong> {item.input_data.personality.substring(0, 100)}{item.input_data.personality.length > 100 ? '...' : ''}</div>
                    {item.input_data.customCharacter && (
                      <div><strong>俗名から含めた漢字:</strong> {item.input_data.customCharacter}</div>
                    )}
                  </div>

                  <h3 className="h3" style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-charcoal)' }}>生成された法名案</h3>
                  <div className="space-y-6">
                    {item.generated_names.map((suggestion, idx) => (
                      <div key={idx} className="result-card">
                        <h4 className="result-title">{suggestion.name} ({suggestion.reading})</h4>
                        <div className="space-y-4" style={{ color: 'var(--color-text-secondary)' }}>
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
