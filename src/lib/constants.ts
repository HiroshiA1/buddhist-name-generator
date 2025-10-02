// バリデーション定数
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
  },
  PERSONALITY: {
    MAX_LENGTH: 1000,
  },
  CUSTOM_CHARACTER: {
    MAX_LENGTH: 1,
    PATTERN: /^[\u4E00-\u9FAF\u3040-\u3096\u30A0-\u30FC]$/,
  },
} as const

// エラーメッセージ
export const ERROR_MESSAGES = {
  NAME_REQUIRED: '故人の名前は必須です',
  NAME_TOO_SHORT: '名前は2文字以上で入力してください',
  NAME_TOO_LONG: '名前は20文字以内で入力してください',
  PERSONALITY_TOO_LONG: '1000文字以内で入力してください',
  CUSTOM_CHARACTER_SINGLE_ONLY: '1文字のみ入力してください',
  CUSTOM_CHARACTER_JAPANESE_ONLY: '日本語の文字を入力してください',
  GENERATION_FAILED: '法名生成中にエラーが発生しました。',
  HISTORY_SAVE_FAILED: '法名の生成は完了しましたが、履歴の保存に失敗しました。',
  QUOTA_EXCEEDED: 'API利用制限に達しました。しばらく時間をおいてからお試しください。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  API_KEY_ERROR: 'APIキーの設定に問題があります。管理者にお問い合わせください。',
  NO_DATA: '法名データの取得に失敗しました。',
  PDF_EXPORT_ERROR: 'PDF出力中にエラーが発生しました。',
  NO_EXPORT_DATA: 'エクスポートする法名案がありません。',
} as const
