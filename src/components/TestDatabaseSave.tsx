'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TestResult {
  step: string;
  error?: unknown;
  errorDetails?: {
    message: string;
    code?: string;
    details?: unknown;
    hint?: string;
  };
  data?: unknown;
  message?: string;
  verification?: {
    totalCount: number | null;
    latestData?: unknown;
  };
}

export default function TestDatabaseSave() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const testSave = async () => {
    setLoading(true)
    setResult(null)

    try {
      // 1. ユーザー情報を取得
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        setResult({ step: 'getUser', error: userError })
        setLoading(false)
        return
      }

      if (!user) {
        setResult({ step: 'getUser', error: 'ユーザーが見つかりません' })
        setLoading(false)
        return
      }

      console.log('User found:', user.id)

      // 2. テストデータを作成
      const testData = {
        user_id: user.id,
        input_data: {
          firstName: 'テスト太郎',
          gender: 'male',
          hasIngo: false,
          hobbies: ['読書'],
          skills: ['プログラミング'],
          personality: 'テスト用の人物',
          customCharacter: '光'
        },
        generated_names: [
          {
            name: '釋光明',
            reading: 'しゃくこうみょう',
            meaning: 'テスト用の法名',
            reasoning: 'テスト用の理由',
            buddhistContext: 'テスト用の背景'
          }
        ],
        is_favorited: false
      }

      console.log('Test data prepared:', testData)

      // 3. データを保存
      const { data: savedData, error: saveError } = await supabase
        .from('generation_history')
        .insert(testData)
        .select()

      if (saveError) {
        console.error('Save error:', saveError)
        setResult({
          step: 'insert',
          error: saveError,
          errorDetails: {
            message: saveError.message,
            code: saveError.code,
            details: saveError.details,
            hint: saveError.hint
          }
        })
      } else {
        console.log('Save success:', savedData)
        setResult({
          step: 'success',
          data: savedData,
          message: 'テストデータの保存に成功しました！'
        })
      }

      // 4. 保存後の確認
      const { data: checkData, error: checkError, count } = await supabase
        .from('generation_history')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      console.log('Check after save:', { checkData, checkError, count })

      if (!checkError && result) {
        setResult({
          ...result,
          verification: {
            totalCount: count,
            latestData: checkData?.[0]
          }
        })
      }

    } catch (error) {
      console.error('Unexpected error:', error)
      setResult({ step: 'unexpected', error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '5px',
      marginTop: '20px'
    }}>
      <h3>データベース保存テスト</h3>
      <button
        onClick={testSave}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? 'テスト中...' : 'テストデータを保存'}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: result.error ? '#f8d7da' : '#d4edda',
          border: `1px solid ${result.error ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '5px'
        }}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}