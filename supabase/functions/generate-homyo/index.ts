import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: corsHeaders
    })
  }


  let requestData
  try {
    requestData = await req.json()
    console.log('Request data:', requestData)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }

  const { firstName, gender, hasIngo, hobbies, skills, personality, customCharacter } = requestData

  console.log('=== DEBUG INFO ===')
  console.log('Request data:', JSON.stringify(requestData, null, 2))
  console.log('hasIngo value:', hasIngo)
  console.log('hasIngo type:', typeof hasIngo)
  console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY)
  
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }

  // ユーザー認証とサブスクリプション情報の取得
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "認証が必要です" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }

  // 使用回数制限チェックを削除（無料版として全機能開放）

  // Gemini APIへのプロンプトを生成
  let prompt = "あなたは浄土真宗の法名を生成するAIアシスタントです。故人の情報に基づいて、浄土真宗の教義に沿った法名を3〜5案提案してください。各法名について、読み方（呉音）、意味、選定理由、使用漢字の仏教的背景を詳細に説明してください。\n\n故人の情報：\n- 俗名: " + firstName + "\n- 性別: " + (gender === 'male' ? '男性' : '女性') + "\n- 院号の有無: " + (hasIngo ? 'あり' : 'なし') + "\n"

  if (hobbies) {
    prompt += "- 趣味: " + hobbies + "\n"
  }
  if (skills) {
    prompt += "- 特技: " + skills + "\n"
  }
  if (personality) {
    prompt += "- 人柄や人生: " + personality + "\n"
  }
  if (customCharacter) {
    prompt += "- 俗名から含めたい漢字: " + customCharacter + "\n"
    prompt += "\n**【指定漢字の配置について】**\n"
    prompt += "- 指定漢字『" + customCharacter + "』は法名の前半後半で様々なパターンで配置してください\n"
    prompt += "- 各案で異なる位置（院号部分・法名前半・法名後半）に配置し、バリエーションを作ってください\n"
    prompt += "- 読み方の自然さと漢字の組み合わせの意味を最優先に配置を決定してください\n"
    prompt += "- 心地よく読めることと、仏教的な意味の深さを判断軸としてください\n"
  }

  const genderSuffix = gender === 'female' ? '釋尼' : '釋'
  
  if (hasIngo) {
    prompt += "\n\n**【重要】院号ありが指定されています。以下の規則を絶対に守ってください:**\n1. 法名は必ず「院号部分 + 院 + " + genderSuffix + " + 法名部分」の構造にする\n2. 例：「慈光院" + genderSuffix + "光徳」「智慧院" + genderSuffix + "真心」\n3. 「釋○○」のような院号なしの形式は絶対に使用禁止\n4. 全ての法名案に例外なく院号を含める\n5. 院号部分は故人の特徴から選ぶ（例：慈光、智慧、福徳、真如、法性など）"

    if (customCharacter) {
      prompt += "\n\n**【院号での指定漢字配置パターン】**\n"
      prompt += "指定漢字『" + customCharacter + "』を以下のパターンで配置し、各案で異なる位置に使用:\n"
      prompt += "- 案1: 院号部分に配置（例：『" + customCharacter + "光院" + genderSuffix + "○○』）\n"
      prompt += "- 案2: 法名前半に配置（例：『○○院" + genderSuffix + customCharacter + "○』）\n"
      prompt += "- 案3: 法名後半に配置（例：『○○院" + genderSuffix + "○" + customCharacter + "』）\n"
      prompt += "- 案4: 院号と法名両方に使用も可（例：『" + customCharacter + "○院" + genderSuffix + customCharacter + "○』）\n"
      prompt += "- 案5: 他の漢字との組み合わせで新たな意味を生成\n"
      prompt += "※必ず読み方の美しさと意味の深さを重視して最適な位置を選んでください"
    }
  } else {
    prompt += "\n\n**院号なしが指定されています。法名は「" + genderSuffix + "○○」の形式で提案してください。**"

    if (customCharacter) {
      prompt += "\n\n**【法名での指定漢字配置パターン】**\n"
      prompt += "指定漢字『" + customCharacter + "』を以下のパターンで配置し、各案で異なる位置に使用:\n"
      prompt += "- 案1: 法名前半に配置（例：『" + genderSuffix + customCharacter + "○』）\n"
      prompt += "- 案2: 法名後半に配置（例：『" + genderSuffix + "○" + customCharacter + "』）\n"
      prompt += "- 案3: 他の漢字と組み合わせて新たな熟語を形成\n"
      prompt += "※『" + genderSuffix + "』の直後に同じ漢字ばかり配置せず、バリエーションを作ってください\n"
      prompt += "※読み方の自然さと仏教的意味を最重視してください"
    }
  }
  
  
  if (hasIngo) {
    const readingExample = genderSuffix === '釋尼' ? 'しゃくに' : 'しゃく'
    prompt += "\n\n**【最重要】以下のJSON形式で回答してください。name欄は必ず「○○院" + genderSuffix + "○○」形式にしてください:**\n\n{\n  \"suggestions\": [\n    {\n      \"name\": \"慈光院" + genderSuffix + "光徳\",\n      \"reading\": \"じこういん" + readingExample + "こうとく\",\n      \"meaning\": \"光の徳を持つ者という意味\",\n      \"reasoning\": \"故人の優しい人柄から光の文字を選択\",\n      \"buddhistContext\": \"光は仏の慈悲を表す重要な概念\"\n    },\n    {\n      \"name\": \"智慧院" + genderSuffix + "真心\",\n      \"reading\": \"ちえいん" + readingExample + "しんしん\",\n      \"meaning\": \"真心をもって仏道を歩む者\",\n      \"reasoning\": \"故人の誠実な生き方を表現\",\n      \"buddhistContext\": \"真心は仏教における重要な徳目\"\n    },\n    {\n      \"name\": \"福徳院" + genderSuffix + "慈恩\",\n      \"reading\": \"ふくとくいん" + readingExample + "じおん\",\n      \"meaning\": \"慈悲と恩恵を表す\",\n      \"reasoning\": \"家族を大切にした人柄を表現\",\n      \"buddhistContext\": \"慈は仏教の根本概念の一つ\"\n    }\n  ]\n}\n\n**絶対に「釋○○」だけの形式は使わないでください。必ず「○○院" + genderSuffix + "○○」の形式で3つ提案してください。**"
  } else {
    prompt += "\n\n**重要**: 必ず以下のJSON形式でのみ回答してください。\n\n{\n  \"suggestions\": [\n    {\n      \"name\": \"釋光徳\",\n      \"reading\": \"しゃくこうとく\",\n      \"meaning\": \"光の徳を持つ者という意味\",\n      \"reasoning\": \"故人の優しい人柄から光の文字を選択\",\n      \"buddhistContext\": \"光は仏の慈悲を表す重要な概念\"\n    },\n    {\n      \"name\": \"釋慈恩\",\n      \"reading\": \"しゃくじおん\",\n      \"meaning\": \"慈悲と恩恵を表す\",\n      \"reasoning\": \"家族を大切にした人柄を表現\",\n      \"buddhistContext\": \"慈は仏教の根本概念の一つ\"\n    },\n    {\n      \"name\": \"釋真心\",\n      \"reading\": \"しゃくしんしん\",\n      \"meaning\": \"真心をもって仏道を歩む者\",\n      \"reasoning\": \"故人の誠実な生き方を表現\",\n      \"buddhistContext\": \"真心は仏教における重要な徳目\"\n    }\n  ]\n}\n\n上記の形式で必ず3つの法名を提案してください。**"
  }

  try {
    console.log('Calling Gemini API with prompt length:', prompt.length)
    
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      },
    )

    console.log('Gemini API response status:', geminiResponse.status)
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error response:', errorText)
      throw new Error("Gemini API error: " + geminiResponse.status + " - " + errorText)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini API response:', JSON.stringify(geminiData, null, 2))
    
    // Geminiからのレスポンスをパースして整形
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API')
    }
    
    const generatedContent = geminiData.candidates[0].content.parts[0].text;
    console.log('Generated content:', generatedContent)
    
    let parsedResponse
    try {
      // JSONの前後に余分な文字があれば除去
      const cleanContent = generatedContent.trim()
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      const jsonContent = jsonMatch ? jsonMatch[0] : cleanContent
      
      parsedResponse = JSON.parse(jsonContent);
      
      // 【重要】院号が指定されているのに院号がついていない場合の強制修正
      if (hasIngo && parsedResponse.suggestions) {
        console.log('=== APPLYING INGO FORCE FIX ===')
        console.log('Original suggestions:', JSON.stringify(parsedResponse.suggestions, null, 2))

        const ingoTemplates = ['慈光院', '智慧院', '福徳院', '真如院', '法性院', '妙法院']

        parsedResponse.suggestions = parsedResponse.suggestions.map((suggestion, index) => {
          // 既に院号がついているかチェック
          if (!suggestion.name.includes('院')) {
            const originalName = suggestion.name.replace(/^釋(尼)?/, '')

            // 指定漢字がある場合は、元の配置パターンを分析して適切に再配置
            if (customCharacter && originalName.includes(customCharacter)) {
              const charPos = originalName.indexOf(customCharacter)
              const nameLength = originalName.length
              const relativePos = charPos / nameLength

              // 位置に応じて院号と法名に配分
              let ingoName, homyoName
              if (relativePos < 0.33) {
                // 前方にある場合：院号に配置
                ingoName = customCharacter + (ingoTemplates[index % ingoTemplates.length]).substring(1)
                homyoName = originalName.replace(customCharacter, '')
              } else if (relativePos > 0.66) {
                // 後方にある場合：そのまま法名に保持
                ingoName = ingoTemplates[index % ingoTemplates.length]
                homyoName = originalName
              } else {
                // 中央付近：パターンに応じて決定
                if (index % 2 === 0) {
                  ingoName = ingoTemplates[index % ingoTemplates.length]
                  homyoName = originalName
                } else {
                  ingoName = (ingoTemplates[index % ingoTemplates.length]).slice(0, -1) + customCharacter + '院'
                  homyoName = originalName.replace(customCharacter, '慧')
                }
              }

              const newName = ingoName + genderSuffix + homyoName
              console.log('Fixing suggestion ' + index + ' (with custom char): ' + suggestion.name + ' -> ' + newName)

              const readingPrefix = ingoName.toLowerCase().replace('院', 'いん') + (genderSuffix === '釋尼' ? 'しゃくに' : 'しゃく')

              return {
                ...suggestion,
                name: newName,
                reading: suggestion.reading.replace(/^しゃく(に)?/, readingPrefix)
              }
            } else {
              // 指定漢字がない場合は従来通り
              const ingoName = ingoTemplates[index % ingoTemplates.length]
              const newName = ingoName + genderSuffix + originalName

              console.log('Fixing suggestion ' + index + ': ' + suggestion.name + ' -> ' + newName)

              const readingPrefix = ingoName.toLowerCase() + 'いん' + (genderSuffix === '釋尼' ? 'しゃくに' : 'しゃく')

              return {
                ...suggestion,
                name: newName,
                reading: suggestion.reading.replace(/^しゃく(に)?/, readingPrefix)
              }
            }
          }
          return suggestion
        })
        
        console.log('Fixed suggestions:', JSON.stringify(parsedResponse.suggestions, null, 2))
      }
      
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError)
      console.error('Raw content:', generatedContent)
      return new Response(JSON.stringify({
        error: 'Failed to parse Gemini response as JSON',
        rawContent: generatedContent,
        parseError: parseError.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      })
    }

    // 使用回数カウントを削除（無料版として無制限利用）

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Detailed error:", error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString(),
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})