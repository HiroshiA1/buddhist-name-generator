-- Supabase SQL Editor で実行してください

-- 1. auth.users テーブルから現在のユーザーIDを取得
SELECT id, email FROM auth.users LIMIT 5;

-- 2. generation_history テーブルの構造を確認
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'generation_history'
ORDER BY ordinal_position;

-- 3. 直接データを挿入（上記で取得したユーザーIDを使用してください）
-- ユーザーIDを置き換えて実行してください
INSERT INTO generation_history (
  user_id,
  input_data,
  generated_names,
  is_favorited
) VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- 最初のユーザーIDを使用
  '{"firstName": "テスト太郎", "gender": "male", "hasIngo": false, "hobbies": ["読書"], "skills": ["プログラミング"], "personality": "テスト用の人物", "customCharacter": "光"}'::jsonb,
  '[{"name": "釋光明", "reading": "しゃくこうみょう", "meaning": "テスト用の法名", "reasoning": "テスト用の理由", "buddhistContext": "テスト用の背景"}]'::jsonb,
  false
)
RETURNING *;

-- 4. データが挿入されたか確認
SELECT * FROM generation_history;

-- 5. RLSポリシーの状態を確認
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'generation_history';

-- 6. RLSが有効かどうか確認
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname = 'generation_history';