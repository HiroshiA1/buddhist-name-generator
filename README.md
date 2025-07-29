# 浄土真宗 法名ジェネレーター

故人の情報に基づき、浄土真宗の教義に沿った法名をAI（Gemini API）を用いて自動生成するWebアプリケーションです。

## 主な機能

- **AIによる法名生成**: 故人の人柄、趣味、特技から最適な法名を複数案提案
- **認証システム**: ユーザー登録・ログイン機能
- **履歴管理**: 生成した法名の履歴を保存・閲覧
- **レスポンシブデザイン**: PC・スマートフォン対応

## 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **バックエンド**: Supabase (認証・データベース・Edge Functions)
- **AI**: Google Gemini API
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、以下の値を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Key (for Supabase Edge Function)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. データベースセットアップ

Supabaseプロジェクトで以下のテーブルを作成してください：

```sql
-- 生成履歴テーブル
CREATE TABLE generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_data JSONB NOT NULL,
  generated_names JSONB NOT NULL,
  is_favorited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシー設定
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON generation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON generation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Supabase Edge Functionのデプロイ

```bash
supabase functions deploy generate-homyo
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## デプロイ

### Vercelへのデプロイ

1. Vercel CLIでログイン：
```bash
vercel login
```

2. プロジェクトをデプロイ：
```bash
vercel --prod
```

3. Vercelダッシュボードで環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 使い方

1. **会員登録**: メールアドレスとパスワードでアカウント作成
2. **ログイン**: 登録したアカウントでログイン
3. **法名生成**: 故人の情報を入力して法名を生成
4. **履歴確認**: マイページで過去の生成履歴を確認

## ライセンス

MIT License

## 作成者

🤖 Generated with [Claude Code](https://claude.ai/code)