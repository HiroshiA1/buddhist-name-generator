'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // 現在のユーザーを取得
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        let historyData = null
        let historyError = null
        let historyCount = 0

        if (user) {
          // 履歴データを取得
          const { data, error, count } = await supabase
            .from('generation_history')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          historyData = data
          historyError = error
          historyCount = count || 0
        }

        // テスト用のデータを挿入してみる
        let testInsertResult = null
        if (user) {
          const testData = {
            user_id: user.id,
            input_data: { test: true, timestamp: new Date().toISOString() },
            generated_names: [{ name: 'テスト法名', reading: 'てすとほうみょう' }]
          }

          const { data: insertData, error: insertError } = await supabase
            .from('generation_history')
            .insert(testData)
            .select()

          testInsertResult = {
            success: !insertError,
            data: insertData,
            error: insertError
          }
        }

        setDebugInfo({
          user: user ? { id: user.id, email: user.email } : null,
          userError,
          historyCount,
          historyData: historyData?.slice(0, 3), // 最初の3件のみ表示
          historyError,
          testInsertResult,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        setDebugInfo({ error: String(error) })
      } finally {
        setLoading(false)
      }
    }

    checkDatabase()
  }, [])

  if (loading) {
    return <div>デバッグ情報を読み込み中...</div>
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '5px',
      marginTop: '20px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3>データベースデバッグ情報</h3>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}