# Supabase データベースデバッグガイド

## 1. Supabase ダッシュボードでテーブルを確認する方法

### ステップ1: ダッシュボードにアクセス
1. https://supabase.com/dashboard/project/chmckpvrvfyjacsvutby にアクセス
2. ログインする

### ステップ2: Table Editor で確認
1. 左メニューから「Table Editor」をクリック
2. `generation_history` テーブルを選択
3. データが存在するか確認

### ステップ3: SQL Editor で確認
1. 左メニューから「SQL Editor」をクリック
2. 以下のクエリを実行：

```sql
-- テーブルの全データを確認（RLSを無視）
SELECT * FROM generation_history;

-- テーブルの行数を確認
SELECT COUNT(*) FROM generation_history;

-- RLSポリシーを確認
SELECT * FROM pg_policies WHERE tablename = 'generation_history';

-- 最近のデータを確認
SELECT * FROM generation_history
ORDER BY created_at DESC
LIMIT 10;
```

## 2. ブラウザでデバッグする方法

### マイページでデバッグ情報を確認
1. マイページ（/mypage）を開く
2. ブラウザの開発者ツール（F12）を開く
3. Consoleタブでログを確認
4. ページ下部にデバッグ情報が表示される（開発環境の場合）

### 確認すべきポイント
- `user_id` が正しく設定されているか
- `historyCount` が0より大きいか
- `historyError` がnullか
- `testInsertResult` が成功しているか

## 3. よくある問題と解決策

### 問題1: テーブルにデータがあるのに表示されない
**原因**: RLSポリシーが正しく設定されていない
**解決策**:
```sql
-- RLSを一時的に無効化してテスト
ALTER TABLE generation_history DISABLE ROW LEVEL SECURITY;
-- テスト後は必ず有効化
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
```

### 問題2: 保存時にエラーが発生する
**原因**: user_id が正しく取得できていない
**解決策**:
1. ログインし直す
2. ブラウザのローカルストレージをクリア
3. Supabase のセッションを確認

### 問題3: 外部キー制約エラー
**原因**: user_id が auth.users テーブルに存在しない
**解決策**:
```sql
-- ユーザーが存在するか確認
SELECT id FROM auth.users WHERE id = 'YOUR_USER_ID';
```

## 4. データを手動で挿入してテスト

SQL Editor で以下を実行：
```sql
-- 現在のユーザーIDを取得
SELECT auth.uid();

-- テストデータを挿入（上記で取得したIDを使用）
INSERT INTO generation_history (
  user_id,
  input_data,
  generated_names,
  is_favorited
) VALUES (
  'YOUR_USER_ID_HERE',
  '{"test": true}'::jsonb,
  '[{"name": "テスト法名"}]'::jsonb,
  false
);
```

## 5. RLSポリシーをリセット

問題が解決しない場合、RLSポリシーをリセット：
```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own generation history" ON generation_history;
DROP POLICY IF EXISTS "Users can insert own generation history" ON generation_history;
DROP POLICY IF EXISTS "Users can update own generation history" ON generation_history;
DROP POLICY IF EXISTS "Users can delete own generation history" ON generation_history;

-- ポリシーを再作成
CREATE POLICY "Users can view own generation history"
  ON generation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation history"
  ON generation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generation history"
  ON generation_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generation history"
  ON generation_history FOR DELETE
  USING (auth.uid() = user_id);
```