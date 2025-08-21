// 法名生成関連の型定義
export interface GenerationRequest {
  firstName: string;
  gender: 'male' | 'female';
  hasIngo: boolean;
  hobbies: string[];
  skills: string[];
  personality: string;
  customCharacter?: string;
}

export interface GeneratedName {
  name: string;
  reading: string;
  meaning: string;
  reasoning: string;
  buddhistContext: string;
}

export interface GenerationResponse {
  suggestions: GeneratedName[];
}

// 履歴関連の型定義
export interface GenerationHistoryItem {
  id: string;
  input_data: GenerationRequest;
  generated_names: GeneratedName[];
  is_favorited: boolean;
  created_at: string;
}

// PDFエクスポート用の型定義
export interface ExportData {
  firstName: string;
  gender: 'male' | 'female';
  hasIngo: boolean;
  hobbies?: string[];
  skills?: string[];
  personality?: string;
  customCharacter?: string;
  generatedNames: GeneratedName[];
  createdAt?: string;
}