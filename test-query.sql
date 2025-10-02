-- generation_history テーブルのデータを確認
SELECT * FROM generation_history;

-- テーブルの列構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'generation_history'
ORDER BY ordinal_position;

-- RLSポリシーの確認
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'generation_history';

-- 現在のユーザーを確認
SELECT auth.uid();

-- テーブルの行数を確認（RLSを無視）
SELECT COUNT(*) FROM generation_history;