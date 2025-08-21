'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { exportToPDF } from '@/lib/pdfExport'
import NameCard from '@/components/Generate/NameCard'
import LoadingSpinner from '@/components/Common/LoadingSpinner'
import { GenerationRequest, GenerationResponse, GeneratedName } from '@/types'

export default function GeneratePage() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [hasIngo, setHasIngo] = useState(false)
  const [hobbies, setHobbies] = useState('')
  const [skills, setSkills] = useState('')
  const [personality, setPersonality] = useState('')
  const [customCharacter, setCustomCharacter] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([])
  const [user, setUser] = useState<unknown>(null)
  
  // バリデーション状態
  const [errors, setErrors] = useState<{
    name?: string;
    personality?: string;
    customCharacter?: string;
  }>({})
  
  const [touched, setTouched] = useState<{
    name?: boolean;
    personality?: boolean;
    customCharacter?: boolean;
  }>({})
  
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

  // バリデーション関数
  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = '故人の名前は必須です'
        } else if (value.trim().length < 2) {
          newErrors.name = '名前は2文字以上で入力してください'
        } else if (value.trim().length > 20) {
          newErrors.name = '名前は20文字以内で入力してください'
        } else {
          delete newErrors.name
        }
        break
        
      case 'personality':
        if (value.length > 1000) {
          newErrors.personality = '1000文字以内で入力してください'
        } else {
          delete newErrors.personality
        }
        break
        
      case 'customCharacter':
        if (value && value.length > 1) {
          newErrors.customCharacter = '1文字のみ入力してください'
        } else if (value && !/^[\u4E00-\u9FAF\u3040-\u3096\u30A0-\u30FC]$/.test(value)) {
          newErrors.customCharacter = '日本語の文字を入力してください'
        } else {
          delete newErrors.customCharacter
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // フィールドがタッチされたときの処理
  const handleFieldBlur = (fieldName: string) => {
    setTouched({ ...touched, [fieldName]: true })
  }

  // 入力変更時の処理
  const handleFieldChange = (fieldName: string, value: string) => {
    // 値を更新
    switch (fieldName) {
      case 'name':
        setName(value)
        break
      case 'personality':
        setPersonality(value)
        break
      case 'customCharacter':
        setCustomCharacter(value)
        break
    }

    // タッチされている場合はリアルタイムバリデーション
    if (touched[fieldName as keyof typeof touched]) {
      validateField(fieldName, value)
    }
  }

  // フォーム送信時の全体バリデーション
  const validateForm = () => {
    const isNameValid = validateField('name', name)
    const isPersonalityValid = validateField('personality', personality)
    const isCustomCharacterValid = validateField('customCharacter', customCharacter)
    
    // すべてのフィールドをtouchedにする
    setTouched({
      name: true,
      personality: true,
      customCharacter: true
    })
    
    return isNameValid && isPersonalityValid && isCustomCharacterValid
  }

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

    // フォーム全体のバリデーション
    if (!validateForm()) {
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

  const handleExportPDF = () => {
    if (generatedNames.length === 0) {
      alert('エクスポートする法名案がありません。')
      return
    }

    const exportData = {
      firstName: name,
      gender,
      hasIngo,
      hobbies: hobbies.split(',').map(s => s.trim()).filter(s => s),
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      personality,
      customCharacter,
      generatedNames,
      createdAt: new Date().toLocaleString('ja-JP')
    }

    exportToPDF(exportData)
  }

  return (
    <div className="min-h-screen" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="container">
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="h2 text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>法名生成</h2>
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="form-group">
              <label htmlFor="name" className="form-label required">故人の名前（俗名）</label>
              <input
                type="text"
                id="name"
                className={`input ${errors.name && touched.name ? 'input-error' : ''} ${!errors.name && touched.name && name ? 'input-success' : ''}`}
                placeholder="例: 田中太郎"
                value={name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                required
              />
              {errors.name && touched.name && (
                <div className="error-message">
                  ⚠️ {errors.name}
                </div>
              )}
              {!errors.name && touched.name && name && (
                <div className="success-message">
                  ✓ 入力完了
                </div>
              )}
              <div className="help-text">
                故人の俗名（本名）を入力してください。法名生成の基礎となります。
              </div>
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
              <label htmlFor="personality" className="form-label">人柄や人生に関する自由記述</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  id="personality"
                  className={`input textarea ${errors.personality && touched.personality ? 'input-error' : ''}`}
                  placeholder="例: 優しく思いやりのある人で、家族を大切にしていました。地域の活動にも積極的に参加し、多くの人に慕われていました。"
                  value={personality}
                  onChange={(e) => handleFieldChange('personality', e.target.value)}
                  onBlur={() => handleFieldBlur('personality')}
                  maxLength={1000}
                ></textarea>
                <div 
                  className={`character-count ${personality.length > 800 ? 'warning' : ''} ${personality.length > 950 ? 'error' : ''}`}
                >
                  {personality.length}/1000
                </div>
              </div>
              {errors.personality && touched.personality && (
                <div className="error-message">
                  ⚠️ {errors.personality}
                </div>
              )}
              <div className="help-text">
                故人の人柄、趣向、人生エピソードなどを詳しく記入することで、より適切な法名が生成されます。
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customCharacter" className="form-label">俗名から含めたい漢字（任意）</label>
              <input
                type="text"
                id="customCharacter"
                className={`input ${errors.customCharacter && touched.customCharacter ? 'input-error' : ''} ${!errors.customCharacter && touched.customCharacter && customCharacter ? 'input-success' : ''}`}
                placeholder="例: 太郎の「太」を含めたい場合は「太」と入力"
                value={customCharacter}
                onChange={(e) => handleFieldChange('customCharacter', e.target.value)}
                onBlur={() => handleFieldBlur('customCharacter')}
                maxLength={1}
              />
              {errors.customCharacter && touched.customCharacter && (
                <div className="error-message">
                  ⚠️ {errors.customCharacter}
                </div>
              )}
              {!errors.customCharacter && touched.customCharacter && customCharacter && (
                <div className="success-message">
                  ✓ 「{customCharacter}」を法名に含めます
                </div>
              )}
              <div className="help-text">
                俗名の中で法名に含めたい漢字があれば1文字入力してください。ひらがなでも入力可能です。
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''} ${Object.keys(errors).length > 0 ? 'btn-disabled' : ''}`}
              style={{ width: '100%', position: 'relative' }}
              disabled={loading || Object.keys(errors).length > 0 || !name.trim()}
            >
              {loading ? '生成中...' : Object.keys(errors).length > 0 ? '入力内容を確認してください' : '法名を生成する'}
            </button>
            {Object.keys(errors).length > 0 && (
              <div className="text-center mt-2">
                <div className="error-message" style={{ justifyContent: 'center' }}>
                  ⚠️ 入力エラーがあります。上記のエラーを修正してください。
                </div>
              </div>
            )}
          </form>


          {generatedNames.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-2xl)' }}>
              <div className="mobile-stack" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 className="h2 text-center mobile-full-width">生成された法名案</h3>
                <button
                  className="btn btn-mobile btn-secondary"
                  onClick={handleExportPDF}
                >
                  📄 PDFエクスポート
                </button>
              </div>
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