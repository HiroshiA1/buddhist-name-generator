# Supabaseセキュリティアラート修正手順

## 修正が必要なアラート

### 1. Function Search Path Mutable ✅ (SQL実行が必要)

**問題**: `update_updated_at_column`関数のsearch_pathが可変

**修正方法**: Supabase SQL Editorで以下を実行

```sql
-- 既存の関数を削除
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- search_pathを固定した関数を再作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- トリガーを再作成（user_subscriptionsテーブル用）
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- トリガーを再作成（user_usageテーブル用）
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- トリガーを再作成（generation_historyテーブル用）
DROP TRIGGER IF EXISTS update_generation_history_updated_at ON generation_history;
CREATE TRIGGER update_generation_history_updated_at
  BEFORE UPDATE ON generation_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. Auth OTP Long Expiry ⚙️ (ダッシュボード設定)

**問題**: OTP（ワンタイムパスワード）の有効期限が1時間以上

**修正方法**:
1. Supabaseダッシュボード → Authentication → Settings
2. 「Email」セクションを開く
3. 「OTP Expiry」を **3600秒（1時間）以下** に設定
   - 推奨: **1800秒（30分）** または **900秒（15分）**
4. 「Save」をクリック

---

### 3. Leaked Password Protection Disabled ⚙️ (ダッシュボード設定)

**問題**: 漏洩パスワード保護が無効

**修正方法**:
1. Supabaseダッシュボード → Authentication → Settings
2. 「Security and Protection」セクション
3. **「Enable Leaked Password Protection」をONにする**
   - HaveIBeenPwnedのデータベースと照合
   - 既知の漏洩パスワードの使用を防止
4. 「Save」をクリック

---

### 4. Vulnerable Postgres Version ⚙️ (ダッシュボード設定)

**問題**: PostgreSQLのバージョンにセキュリティパッチが利用可能

**修正方法**:
1. Supabaseダッシュボード → Settings → Infrastructure
2. 「Postgres version」セクション
3. **「Upgrade」ボタンをクリック**
4. アップグレードの確認ダイアログで「Confirm」
5. アップグレードが完了するまで待機（数分～10分程度）

**注意事項**:
- アップグレード中はデータベースへのアクセスが一時的に制限される場合があります
- メンテナンス時間帯（アクセスが少ない時間）に実施することを推奨

---

## 修正実施チェックリスト

- [ ] **SQL実行**: Function Search Path Mutableの修正SQL実行
- [ ] **Auth設定**: OTP Expiryを3600秒以下に設定
- [ ] **Auth設定**: Leaked Password Protectionを有効化
- [ ] **Infrastructure**: PostgreSQLバージョンアップグレード

---

## 修正後の確認

すべての修正が完了したら、Supabaseダッシュボードの「Advisors」または「Reports」で警告が消えていることを確認してください。

---

**作成日**: 2025-10-02
**目的**: セキュリティアラートの解消によるシステムの安全性向上
