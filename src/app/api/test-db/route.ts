import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  // サービスロールキーを使用してRLSをバイパス
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // テーブルの全データを取得（RLSをバイパス）
    const { data: allData, error: allError } = await supabase
      .from('generation_history')
      .select('*')

    // テーブル情報を取得
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'generation_history' })
      .single()

    const result = {
      totalRows: allData?.length || 0,
      allData: allData || [],
      allError: allError?.message || null,
      tableError: tableError?.message || null,
      tableInfo: tableInfo || null
    }

    console.log('Database test result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}