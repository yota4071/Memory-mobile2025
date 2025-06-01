-- ==========================================
-- 初期スキーマ作成
-- 作成日: 2024-12-01
-- 説明: アカウント管理の基本テーブル
-- ==========================================

-- データベース拡張の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- accounts テーブル（ユーザーアカウント管理）
-- ==========================================
CREATE TABLE IF NOT EXISTS accounts (
    id              SERIAL PRIMARY KEY,
    uuid            UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    bio             TEXT DEFAULT '',
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    last_login      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 制約
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- ==========================================
-- インデックス作成（accounts）
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
CREATE INDEX IF NOT EXISTS idx_accounts_uuid ON accounts(uuid);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at DESC);

-- ==========================================
-- updated_at 自動更新関数
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- トリガー作成
-- ==========================================
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- コメント追加（ドキュメント化）
-- ==========================================
COMMENT ON TABLE accounts IS 'ユーザーアカウント情報を管理するメインテーブル';
COMMENT ON COLUMN accounts.id IS 'プライマリキー（自動増分）';
COMMENT ON COLUMN accounts.uuid IS 'ユニークID（外部公開用）';
COMMENT ON COLUMN accounts.username IS 'ユーザー名（3文字以上、一意）';
COMMENT ON COLUMN accounts.email IS 'メールアドレス（ログイン用、一意）';
COMMENT ON COLUMN accounts.password_hash IS 'bcryptでハッシュ化されたパスワード';
COMMENT ON COLUMN accounts.bio IS '自己紹介文（最大500文字）';
COMMENT ON COLUMN accounts.avatar_url IS 'プロフィール画像のURL';
COMMENT ON COLUMN accounts.is_active IS 'アカウント有効フラグ';
COMMENT ON COLUMN accounts.is_verified IS 'メール認証済みフラグ';
COMMENT ON COLUMN accounts.last_login IS '最終ログイン日時';

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ accounts テーブルが正常に作成されました';
END $$;