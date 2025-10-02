import { ERROR_MESSAGES } from './constants'

/**
 * エラーメッセージを生成する
 */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return ERROR_MESSAGES.GENERATION_FAILED
  }

  const message = error.message

  if (message.includes('quota')) {
    return ERROR_MESSAGES.QUOTA_EXCEEDED
  }

  if (message.includes('network')) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  if (message.includes('GEMINI_API_KEY')) {
    return ERROR_MESSAGES.API_KEY_ERROR
  }

  return message || ERROR_MESSAGES.GENERATION_FAILED
}

/**
 * Supabaseエラーのログを出力（開発環境のみ）
 */
export function logSupabaseError(
  context: string,
  error: { message: string; code?: string; details?: unknown; hint?: string }
): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
  }
}

/**
 * 履歴保存エラーのアラートメッセージを生成
 */
export function getHistorySaveErrorMessage(error: {
  message: string
  code?: string
  hint?: string
}): string {
  let errorMsg = `${ERROR_MESSAGES.HISTORY_SAVE_FAILED}\n\n履歴保存エラー: ${error.message}`

  if (error.code) {
    errorMsg += `\nエラーコード: ${error.code}`
  }

  if (error.hint) {
    errorMsg += `\nヒント: ${error.hint}`
  }

  errorMsg += '\n\nマイページに表示されない場合があります。'

  return errorMsg
}
