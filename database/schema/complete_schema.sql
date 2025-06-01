-- ==========================================
-- 完全なデータベーススキーマ
-- Memory Mobile 2025
-- ==========================================

-- 既存テーブルの削除
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- accounts テーブル
-- ==========================================
CREATE TABLE accounts (
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
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- ==========================================
-- posts テーブル
-- ==========================================
CREATE TABLE posts (
    id              SERIAL PRIMARY KEY,
    uuid            UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id         INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    image_url       VARCHAR(500),
    image_metadata  JSONB,
    
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    address         TEXT,
    location_name   VARCHAR(255),
    
    likes_count     INTEGER DEFAULT 0,
    comments_count  INTEGER DEFAULT 0,
    views_count     INTEGER DEFAULT 0,
    
    is_public       BOOLEAN DEFAULT TRUE,
    is_deleted      BOOLEAN DEFAULT FALSE,
    expires_at      TIMESTAMP WITH TIME ZONE,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT content_length CHECK (char_length(content) <= 2000),
    CONSTRAINT valid_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    CONSTRAINT valid_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
    CONSTRAINT counts_non_negative CHECK (
        likes_count >= 0 AND 
        comments_count >= 0 AND 
        views_count >= 0
    )
);

-- ==========================================
-- likes テーブル
-- ==========================================
CREATE TABLE likes (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, post_id)
);

-- ==========================================
-- comments テーブル
-- ==========================================
CREATE TABLE comments (
    id          SERIAL PRIMARY KEY,
    uuid        UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id     INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id   INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT comment_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT comment_content_length CHECK (char_length(content) <= 1000)
);

-- ==========================================
-- インデックス作成
-- ==========================================

-- accounts
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_username ON accounts(username);
CREATE INDEX idx_accounts_uuid ON accounts(uuid);
CREATE INDEX idx_accounts_active ON accounts(is_active);
CREATE INDEX idx_accounts_created_at ON accounts(created_at DESC);

-- posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_uuid ON posts(uuid);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_location ON posts(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_posts_public ON posts(is_public, is_deleted, created_at DESC) WHERE is_public = TRUE AND is_deleted = FALSE;

-- likes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- comments
CREATE INDEX idx_comments_post_id ON comments(post_id, created_at ASC) WHERE is_deleted = FALSE;
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- ==========================================
-- 関数とトリガー
-- ==========================================

-- updated_at更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガー
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- いいね数更新関数
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- いいね数更新トリガー
CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ 全てのテーブルとインデックスが正常に作成されました';
    RAISE NOTICE '📊 テーブル数: %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public');
END $$;