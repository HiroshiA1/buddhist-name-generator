'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface GenerationRequest {
  firstName: string;
  gender: 'male' | 'female';
  hasIngo: boolean;
  hobbies: string[];
  skills: string[];
  personality: string;
  customCharacter?: string;
}

interface GenerationResponse {
  suggestions: Array<{
    name: string;
    reading: string;
    meaning: string;
    reasoning: string;
    buddhistContext: string;
  }>;
}

export default function GeneratePage() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [hasIngo, setHasIngo] = useState(false)
  const [hobbies, setHobbies] = useState('')
  const [skills, setSkills] = useState('')
  const [personality, setPersonality] = useState('')
  const [customCharacter, setCustomCharacter] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedNames, setGeneratedNames] = useState<GenerationResponse['suggestions']>([])
  const [user, setUser] = useState<unknown>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    checkAuth()
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>認証確認中...</div>
      </div>
    )
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneratedNames([])

    // 俗名漢字の文字数チェック
    if (customCharacter && customCharacter.length > 1) {
      alert('俗名から含めたい漢字は1文字のみ入力してください。')
      setLoading(false)
      return
    }

    try {
      const requestBody: GenerationRequest = {
        firstName: name,
        gender,
        hasIngo,
        hobbies: hobbies.split(',').map(s => s.trim()).filter(s => s),
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        personality,
        ...(customCharacter && customCharacter.length === 1 && { customCharacter }),
      }

      const { data, error: functionError } = await supabase.functions.invoke('generate-homyo', {
        body: requestBody
      })

      if (functionError) {
        console.error('Function error:', functionError)
        throw new Error(functionError.message || '法名生成に失敗しました。')
      }

      if (!data) {
        throw new Error('法名データの取得に失敗しました。')
      }
      setGeneratedNames(data.suggestions)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: insertError } = await supabase
          .from('generation_history')
          .insert({
            user_id: user.id,
            input_data: requestBody,
            generated_names: data.suggestions,
          })
        if (insertError) {
          console.error('履歴保存エラー:', insertError.message)
        }
      }

    } catch (error: unknown) {
      console.error('法名生成エラー:', error)
      
      let errorMessage = '法名生成中にエラーが発生しました。'
      
      if (error instanceof Error && error.message?.includes('quota')) {
        errorMessage = 'API利用制限に達しました。しばらく時間をおいてからお試しください。'
      } else if (error instanceof Error && error.message?.includes('network')) {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      } else if (error instanceof Error && error.message?.includes('GEMINI_API_KEY')) {
        errorMessage = 'APIキーの設定に問題があります。管理者にお問い合わせください。'
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="container">
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="h2 text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>法名生成</h2>
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="form-group">
              <label htmlFor="name" className="form-label">故人の名前（俗名）</label>
              <input
                type="text"
                id="name"
                className="input"
                placeholder="例: 田中太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">性別</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={() => setGender('male' as const)}
                    style={{ accentColor: 'var(--color-sand-beige)' }}
                  />
                  <span>男性</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={() => setGender('female' as const)}
                    style={{ accentColor: 'var(--color-sand-beige)' }}
                  />
                  <span>女性</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">院号の有無</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="hasIngo"
                    value="true"
                    checked={hasIngo === true}
                    onChange={() => setHasIngo(true)}
                    style={{ accentColor: 'var(--color-sand-beige)' }}
                  />
                  <span>あり</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="hasIngo"
                    value="false"
                    checked={hasIngo === false}
                    onChange={() => setHasIngo(false)}
                    style={{ accentColor: 'var(--color-sand-beige)' }}
                  />
                  <span>なし</span>
                </label>
              </div>
            </div>

            {hasIngo && (
              <div className="text-sm text-gray-600 mt-2 p-3 bg-blue-50 rounded">
                <strong>院号について:</strong> 院号は、〇〇院釋〇〇{gender === 'female' ? '（女性の場合は〇〇院釋尼〇〇）' : ''}となります。
              </div>
            )}

            <div className="form-group">
              <label htmlFor="hobbies" className="form-label">趣味（複数入力可、カンマ区切り）</label>
              <input
                type="text"
                id="hobbies"
                className="input"
                placeholder="例: 読書, 写真, 園芸"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills" className="form-label">特技（複数入力可、カンマ区切り）</label>
              <input
                type="text"
                id="skills"
                className="input"
                placeholder="例: 囲碁, 料理, 書道"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="personality" className="form-label">人柄や人生に関する自由記述（最大1000文字）</label>
              <textarea
                id="personality"
                className="input textarea"
                placeholder="例: 優しく思いやりのある人で、家族を大切にしていました。地域の活動にも積極的に参加し、多くの人に慕われていました。"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                maxLength={1000}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="customCharacter" className="form-label">俗名から含めたい漢字（任意、漢字1文字のみ）</label>
              <input
                type="text"
                id="customCharacter"
                className="input"
                placeholder="例: 太郎の「太」を含めたい場合は「太」と入力"
                value={customCharacter}
                onChange={(e) => setCustomCharacter(e.target.value)}
              />
              <div className="text-sm text-gray-600 mt-1">
                ひらがなから変換可能です。ただし最終的に漢字1文字のみ有効です。
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              style={{ width: '100%', position: 'relative' }}
              disabled={loading}
            >
              {loading ? '生成中...' : '法名を生成する'}
            </button>
          </form>

          {generatedNames.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-2xl)' }}>
              <h3 className="h2 text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>生成された法名案</h3>
              <div className="space-y-8">
                {generatedNames.map((suggestion, index) => (
                  <div key={index} className="result-card fade-in">
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
          )}
        </div>
      </div>
    </div>
  )
}