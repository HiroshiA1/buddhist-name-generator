'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { exportToPDF } from '@/lib/pdfExport'
import { VALIDATION_RULES, ERROR_MESSAGES } from '@/lib/constants'
import { getErrorMessage, logSupabaseError, getHistorySaveErrorMessage } from '@/lib/errorHandling'
import type { GenerationRequest, GeneratedName } from '@/types'

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
          newErrors.name = ERROR_MESSAGES.NAME_REQUIRED
        } else if (value.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH) {
          newErrors.name = ERROR_MESSAGES.NAME_TOO_SHORT
        } else if (value.trim().length > VALIDATION_RULES.NAME.MAX_LENGTH) {
          newErrors.name = ERROR_MESSAGES.NAME_TOO_LONG
        } else {
          delete newErrors.name
        }
        break

      case 'personality':
        if (value.length > VALIDATION_RULES.PERSONALITY.MAX_LENGTH) {
          newErrors.personality = ERROR_MESSAGES.PERSONALITY_TOO_LONG
        } else {
          delete newErrors.personality
        }
        break

      case 'customCharacter':
        if (value && value.length > VALIDATION_RULES.CUSTOM_CHARACTER.MAX_LENGTH) {
          newErrors.customCharacter = ERROR_MESSAGES.CUSTOM_CHARACTER_SINGLE_ONLY
        } else if (value && !VALIDATION_RULES.CUSTOM_CHARACTER.PATTERN.test(value)) {
          newErrors.customCharacter = ERROR_MESSAGES.CUSTOM_CHARACTER_JAPANESE_ONLY
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
        throw new Error(functionError.message || ERROR_MESSAGES.GENERATION_FAILED)
      }

      if (!data) {
        throw new Error(ERROR_MESSAGES.NO_DATA)
      }
      setGeneratedNames(data.suggestions)

      // 履歴保存処理
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        logSupabaseError('ユーザー取得', userError)
      } else if (currentUser) {
        const historyData = {
          user_id: currentUser.id,
          input_data: requestBody,
          generated_names: data.suggestions,
        }

        const { error: insertError } = await supabase
          .from('generation_history')
          .insert(historyData)
          .select()

        if (insertError) {
          logSupabaseError('履歴保存', insertError)
          alert(getHistorySaveErrorMessage(insertError))
        }
      }

    } catch (error: unknown) {
      alert(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (generatedNames.length === 0) {
      alert(ERROR_MESSAGES.NO_EXPORT_DATA)
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

    try {
      await exportToPDF(exportData)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('PDF出力エラー:', error)
      }
      alert(ERROR_MESSAGES.PDF_EXPORT_ERROR)
    }
  }

  return (
    <div className="min-h-screen" style={{ padding: 'var(--spacing-2xl) 0', background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)' }}>
      <div className="container">
        <div className="card fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-2xl)',
            paddingBottom: 'var(--spacing-xl)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <h2 className="h2" style={{ 
              marginBottom: 'var(--spacing-sm)',
              fontSize: '2.25rem',
              background: 'linear-gradient(135deg, #2c2c2c, #404040)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>法名生成</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
              故人の情報を入力して、浄土真宗の教義に基づいた法名を生成します
            </p>
          </div>
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
              <div style={{
                padding: 'var(--spacing-md)',
                background: 'linear-gradient(135deg, #f9f7f4, #f5f1eb)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-sand-beige-light)',
                marginTop: 'var(--spacing-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '1.2rem' }}>📿</span>
                  <div>
                    <strong style={{ color: 'var(--color-charcoal)' }}>院号について</strong>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                      院号は、〇〇院釋〇〇{gender === 'female' ? '（女性の場合は〇〇院釋尼〇〇）' : ''}となります。
                    </p>
                  </div>
                </div>
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
              <label htmlFor="skills" className="form-label">仕事・職業（複数入力可、カンマ区切り）</label>
              <input
                type="text"
                id="skills"
                className="input"
                placeholder="例: 教師, 医師, 会社員"
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
              style={{ 
                width: '100%', 
                position: 'relative',
                marginTop: 'var(--spacing-xl)',
                background: loading ? '#e5e7eb' : Object.keys(errors).length > 0 ? '#e5e7eb' : 'linear-gradient(135deg, #e8dcc6, #d4c4a8)',
                boxShadow: loading || Object.keys(errors).length > 0 ? 'none' : '0 4px 15px rgba(232, 220, 198, 0.4)',
                fontSize: '1.05rem',
                fontWeight: 'var(--font-weight-semibold)'
              }}
              disabled={loading || Object.keys(errors).length > 0 || !name.trim()}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span className="spinner"></span>
                  生成中...
                </span>
              ) : Object.keys(errors).length > 0 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  ⚠️ 入力内容を確認してください
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  ✨ 法名を生成する
                </span>
              )}
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
            <div style={{ 
              marginTop: 'var(--spacing-3xl)', 
              paddingTop: 'var(--spacing-2xl)',
              borderTop: '2px solid var(--border-color)'
            }}>
              <div className="mobile-stack" style={{ 
                marginBottom: 'var(--spacing-xl)',
                alignItems: 'center'
              }}>
                <div>
                  <h3 className="h2 mobile-full-width" style={{
                    fontSize: '1.875rem',
                    background: 'linear-gradient(135deg, #d4af37, #b8941f)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: 'var(--spacing-xs)'
                  }}>生成された法名案</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                    以下の法名案から選択してください
                  </p>
                </div>
                <button
                  className="btn btn-mobile btn-secondary"
                  onClick={handleExportPDF}
                  style={{
                    background: 'white',
                    border: '2px solid var(--color-sand-beige)',
                    color: 'var(--color-charcoal)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    📄 PDFエクスポート
                  </span>
                </button>
              </div>
              <div className="space-y-8">
                {generatedNames.map((suggestion, index) => (
                  <div key={index} className="result-card fade-in" style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards`
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 'var(--spacing-md)',
                      right: 'var(--spacing-md)',
                      background: 'linear-gradient(135deg, #e8dcc6, #d4c4a8)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: 'var(--font-weight-semibold)'
                    }}>
                      案 {index + 1}
                    </div>
                    <h4 className="result-title">
                      {suggestion.name}
                      <span style={{
                        fontSize: '1.1rem',
                        marginLeft: 'var(--spacing-sm)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 'var(--font-weight-normal)'
                      }}>（{suggestion.reading}）</span>
                    </h4>
                    <div className="space-y-4">
                      <div style={{ 
                        padding: 'var(--spacing-md)',
                        background: 'var(--color-off-white)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <p style={{ color: 'var(--color-charcoal)', fontWeight: 'var(--font-weight-medium)', marginBottom: '0.5rem' }}>💠 意味</p>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{suggestion.meaning}</p>
                      </div>
                      <div style={{ 
                        padding: 'var(--spacing-md)',
                        background: 'var(--color-off-white)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <p style={{ color: 'var(--color-charcoal)', fontWeight: 'var(--font-weight-medium)', marginBottom: '0.5rem' }}>📝 選定理由</p>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{suggestion.reasoning}</p>
                      </div>
                      <div style={{ 
                        padding: 'var(--spacing-md)',
                        background: 'var(--color-off-white)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <p style={{ color: 'var(--color-charcoal)', fontWeight: 'var(--font-weight-medium)', marginBottom: '0.5rem' }}>🏛️ 仏教的背景</p>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{suggestion.buddhistContext}</p>
                      </div>
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