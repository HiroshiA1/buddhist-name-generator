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

**修正方法（ダッシュボード）**:

以下の順番で探してください：

1. **Authentication** → **Emails** → 各メールテンプレート内
   - 「Confirm signup」「Magic Link」などのテンプレートを開く
   - 「Token Expiry」「OTP Expiry」などの設定があるか確認

2. **Authentication** → **Configuration**
   - スクロールして「Email」または「OTP」関連の設定を探す
   - 「Token expiry」「OTP expiry」などのフィールドがあるか確認

3. **Authentication** → **Rate Limits**
   - OTP Rate Limitは設定できますが、expiryは別の場所です

**注意**: 現在のSupabase UIでは、OTP Expiryがダッシュボードに表示されない場合があります。その場合は以下の方法で設定してください。

**修正方法（Supabase CLI - 推奨）**:

```bash
# Supabase CLIをインストール（未インストールの場合）
npm install -g supabase

# プロジェクトにログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref YOUR_PROJECT_REF

# OTP有効期限を3600秒（1時間）に設定
supabase secrets set GOTRUE_MAILER_OTP_EXP=3600

# 設定を確認
supabase secrets list
```

**修正方法（Supabase Management API）**:

ダッシュボードとCLIの両方で設定できない場合、Management APIを使用：

```bash
curl -X PATCH \
  'https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/config/auth' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "MAILER_OTP_EXP": 3600
  }'
```

**推奨設定値**:
- **3600秒（1時間）** - 警告を解消する最小値
- **1800秒（30分）** - より安全
- **900秒（15分）** - 最も安全（UX要検討）

---

### 3. Leaked Password Protection Disabled ⚙️ (ダッシュボード設定)

**問題**: 漏洩パスワード保護が無効

**修正方法（ダッシュボード）**:

以下の場所を確認してください：

1. **Authentication** → **Policies** または **Configuration**
   - 「Password Requirements」「Password Security」セクションを探す
   - **「Check passwords against HaveIBeenPwned」**
   - **「Enable leaked password protection」**
   - などのチェックボックスを探してONにする

2. **Authentication** → **Attack Protection**
   - パスワード関連のセキュリティ設定があるか確認

**⚠️ 重要**:
- この機能は **Pro Plan以上** でのみ利用可能です
- Free Planの場合は、プランアップグレードが必要です
- ダッシュボードに表示されない場合、プランを確認してください

**プランの確認方法**:
1. Settings → Billing で現在のプランを確認
2. Free Planの場合、Pro Planへのアップグレードを検討

**追加のパスワードセキュリティ設定** (Policies/Configurationで設定):
- ✅ Minimum password length: **8文字以上**
- ✅ Require at least one digit
- ✅ Require at least one lowercase letter
- ✅ Require at least one uppercase letter
- ✅ Require at least one symbol

**Supabase CLIでの確認**:

```bash
# 現在のAuth設定を確認
supabase status
```

---

### 4. Vulnerable Postgres Version ⚙️ (ダッシュボード設定)

**問題**: PostgreSQLのバージョンにセキュリティパッチが利用可能

**修正方法**:

#### 方法1: In-place Upgrade（推奨 - 1GB以上のプロジェクト）

1. Supabaseダッシュボード → **Settings** → **Infrastructure**
2. 「Database」セクションで現在のPostgreSQLバージョンを確認
3. **「Upgrade project」ボタン** をクリック（表示されている場合）
4. アップグレードのダウンタイムについて確認
5. 「Confirm」をクリック
6. アップグレードが完了するまで待機（プロジェクトサイズにより異なる）

#### 方法2: Pause and Restore（Free Tierのみ）

1. Supabaseダッシュボード → **Settings** → **General**
2. 「Pause project」をクリック
3. プロジェクトが一時停止されたら「Restore project」をクリック
4. 復元時に最新のPostgreSQLバージョンが適用される

**注意事項**:
- ⚠️ **アップグレード中はダウンタイムが発生します**
- メンテナンス時間帯（アクセスが少ない時間）に実施することを強く推奨
- アップグレード前にバックアップを確認
- リリースノートで破壊的変更を確認
- カスタムロールやエクステンションは手動で再設定が必要な場合があります

**アップグレード前の準備**:
```bash
# Supabase CLIでバックアップを確認
supabase db dump -f backup.sql
```

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

---

## 補足情報

### Settings → Auth へのアクセス方法

1. Supabaseダッシュボード (https://supabase.com/dashboard) にログイン
2. プロジェクト一覧から該当プロジェクトを選択
3. 左サイドバーの **⚙️ Settings** アイコンをクリック
4. サブメニューから **Auth** を選択

### 設定が見つからない場合

一部の設定は以下の理由で表示されない場合があります：

- **プランの制限**: Leaked Password Protectionなど、Pro Plan以上でのみ利用可能な機能
- **UIの更新**: Supabaseは頻繁にUIを更新しているため、設定場所が変わる可能性があります
- **環境変数での設定**: 一部設定は環境変数でのみ設定可能な場合があります

#### 環境変数での設定例

Supabase CLIを使用して設定:

```bash
# OTP有効期限を3600秒（1時間）に設定
supabase secrets set GOTRUE_MAILER_OTP_EXP=3600

# 設定を確認
supabase secrets list
```

### 参考リンク

- [Supabase Auth設定ガイド](https://supabase.com/docs/guides/auth)
- [パスワードセキュリティ](https://supabase.com/docs/guides/auth/password-security)
- [本番環境への移行](https://supabase.com/docs/guides/platform/going-into-prod)
- [PostgreSQLアップグレード](https://supabase.com/docs/guides/platform/upgrading)

---

**作成日**: 2025-10-02
**更新日**: 2025-10-02
**目的**: セキュリティアラートの解消によるシステムの安全性向上
**参照ドキュメント**: Supabase公式ドキュメント 2025年版
