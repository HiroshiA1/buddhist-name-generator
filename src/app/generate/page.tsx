'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { exportToPDF } from '@/lib/pdfExport'
import LoadingSpinner from '@/components/Common/LoadingSpinner'
import { GenerationRequest, GenerationResponse, GeneratedName } from '@/types'

// 新しいUIコンポーネントのインポート
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import Card from '@/components/UI/Card'
import Modal from '@/components/UI/Modal'
import Tooltip from '@/components/UI/Tooltip'

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
  const [showExportModal, setShowExportModal] = useState(false)
  
  // バリデーション状態
  const [errors, setErrors] = useState<{
    name?: string;
    personality?: string;
    customCharacter?: string;
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

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!name.trim()) {
      newErrors.name = '故人の名前を入力してください'
    }
    
    if (personality && personality.length > 500) {
      newErrors.personality = '性格・人柄は500文字以内で入力してください'
    }
    
    if (customCharacter && !/^[一-龯]{0,1}$/.test(customCharacter)) {
      newErrors.customCharacter = '漢字1文字を入力してください'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerate = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setGeneratedNames([])
    
    try {
      const requestData: GenerationRequest = {
        firstName: name,
        gender,
        hasIngo,
        hobbies: hobbies.split('、').filter(h => h.trim()),
        skills: skills.split('、').filter(s => s.trim()),
        personality,
        customCharacter
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('生成に失敗しました')
      }

      const data: GenerationResponse = await response.json()
      setGeneratedNames(data.suggestions)
      
      // 履歴を保存
      if (user) {
        await supabase.from('generation_history').insert({
          user_id: (user as any).id,
          input_data: requestData,
          generated_names: data.suggestions
        })
      }
    } catch (error) {
      console.error('Error:', error)
      alert('法名の生成中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    exportToPDF({
      firstName: name,
      gender,
      hasIngo,
      hobbies: hobbies.split('、').filter(h => h.trim()),
      skills: skills.split('、').filter(s => s.trim()),
      personality,
      customCharacter,
      generatedNames,
      createdAt: new Date().toISOString()
    })
    setShowExportModal(false)
  }

  if (!user) {
    return <LoadingSpinner message="認証を確認中..." />
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* ヘッダー */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[var(--text)]">
              法名生成
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              故人の情報を入力して、ふさわしい法名を生成します
            </p>
          </div>

          {/* 入力フォーム */}
          <Card variant="elevated" padding="lg">
            <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[var(--text)]">基本情報</h2>
                
                <Input
                  label="故人の名前"
                  placeholder="山田太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  showRequired
                />

                {/* 性別選択 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--text)]">
                    性別 <span className="text-[var(--danger)]">*</span>
                  </label>
                  <div className="flex gap-4" role="radiogroup">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                        className="w-4 h-4 text-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]"
                      />
                      <span className="text-[var(--text)]">男性</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                        className="w-4 h-4 text-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]"
                      />
                      <span className="text-[var(--text)]">女性</span>
                    </label>
                  </div>
                </div>

                {/* 院号 */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasIngo"
                    checked={hasIngo}
                    onChange={(e) => setHasIngo(e.target.checked)}
                    className="w-4 h-4 text-[var(--brand)] rounded focus:ring-2 focus:ring-[var(--brand)]"
                  />
                  <label htmlFor="hasIngo" className="text-[var(--text)] cursor-pointer">
                    院号を含める
                  </label>
                  <Tooltip content="院号は特に功績のあった方に付けられる称号です">
                    <button
                      type="button"
                      className="text-[var(--muted)] hover:text-[var(--text)]"
                      aria-label="院号の説明"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[var(--text)]">詳細情報（任意）</h2>
                
                <Input
                  label="趣味"
                  placeholder="読書、園芸、釣り（複数ある場合は読点で区切ってください）"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  helpText="故人の趣味を入力してください"
                />

                <Input
                  label="特技・職業"
                  placeholder="料理、プログラミング、教師"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  helpText="故人の特技や職業を入力してください"
                />

                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--text)]">
                    性格・人柄
                  </label>
                  <textarea
                    className="w-full min-h-[120px] px-4 py-2.5 bg-[var(--panel)] text-[var(--text)] border border-[var(--border)] rounded-lg resize-vertical focus:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
                    placeholder="温厚で思いやりがあり、いつも家族のことを第一に考える人でした..."
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    maxLength={500}
                  />
                  <div className="mt-1 text-sm text-[var(--muted)] text-right">
                    {personality.length}/500
                  </div>
                  {errors.personality && (
                    <p className="mt-2 text-sm text-[var(--danger)]">{errors.personality}</p>
                  )}
                </div>

                <Input
                  label="希望する文字"
                  placeholder="慈"
                  value={customCharacter}
                  onChange={(e) => setCustomCharacter(e.target.value)}
                  error={errors.customCharacter}
                  helpText="法名に含めたい漢字を1文字入力してください"
                  maxLength={1}
                />
              </div>

              {/* 生成ボタン */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={loading}
                  disabled={loading || !name.trim()}
                  className="min-w-[200px]"
                >
                  法名を生成する
                </Button>
              </div>
            </form>
          </Card>

          {/* 生成結果 */}
          {generatedNames.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[var(--text)]">生成された法名</h2>
                <Button
                  variant="secondary"
                  onClick={() => setShowExportModal(true)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                >
                  PDFで保存
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {generatedNames.map((suggestion, index) => (
                  <Card key={index} variant="elevated" hoverable>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-sm text-[var(--muted)] mb-2">
                          法名案 {index + 1}
                        </div>
                        <div className="text-3xl font-bold text-[var(--text)] tracking-wider mb-1">
                          {suggestion.name}
                        </div>
                        <div className="text-lg text-[var(--text-secondary)]">
                          {suggestion.reading}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--muted)] mb-1">意味</h4>
                          <p className="text-[var(--text)]">{suggestion.meaning}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[var(--muted)] mb-1">選定理由</h4>
                          <p className="text-[var(--text)]">{suggestion.reasoning}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[var(--muted)] mb-1">仏教的背景</h4>
                          <p className="text-[var(--text)]">{suggestion.buddhistContext}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDFエクスポートモーダル */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="PDFで保存"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>
              キャンセル
            </Button>
            <Button onClick={handleExport}>
              ダウンロード
            </Button>
          </div>
        }
      >
        <p className="text-[var(--text)]">
          生成された法名をPDF形式でダウンロードします。
          印刷や保存にご利用ください。
        </p>
      </Modal>
    </main>
  )
}