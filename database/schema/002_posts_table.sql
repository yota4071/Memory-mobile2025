-- ==========================================
-- 投稿関連テーブル作成
-- 作成日: 2024-12-01
-- 説明: 投稿、いいね、コメント機能のテーブル
-- ==========================================

-- ==========================================
-- posts テーブル（投稿管理）
-- ==========================================
CREATE TABLE IF NOT EXISTS posts (
    id              SERIAL PRIMARY KEY,
    uuid            UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id         INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    image_url       VARCHAR(500),
    image_metadata  JSONB,                     -- 画像のメタデータ（サイズ、形式など）
    
    -- 位置情報
    latitude        DECIMAL(10, 8),            -- 緯度（-90.0 to 90.0）
    longitude       DECIMAL(11, 8),            -- 経度（-180.0 to 180.0）
    address         TEXT,                      -- 住所（逆ジオコーディング結果）
    location_name   VARCHAR(255),              -- 場所名（例：渋谷駅）
    
    -- 統計情報
    likes_count     INTEGER DEFAULT 0,
    comments_count  INTEGER DEFAULT 0,
    views_count     INTEGER DEFAULT 0,
    
    -- 投稿設定
    is_public       BOOLEAN DEFAULT TRUE,      -- 公開設定
    is_deleted      BOOLEAN DEFAULT FALSE,     -- 論理削除フラグ
    expires_at      TIMESTAMP WITH TIME ZONE,  -- 自動削除日時（任意）
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 制約
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
-- likes テーブル（いいね管理）
-- ==========================================
CREATE TABLE IF NOT EXISTS likes (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 制約：同じユーザーが同じ投稿に重複いいね防止
    UNIQUE(user_id, post_id)
);

-- ==========================================
-- comments テーブル（コメント管理）
-- ==========================================
CREATE TABLE IF NOT EXISTS comments (
    id          SERIAL PRIMARY KEY,
    uuid        UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id     INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id   INTEGER REFERENCES comments(id) ON DELETE CASCADE,  -- 返信コメント用
    content     TEXT NOT NULL,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 制約
    CONSTRAINT comment_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT comment_content_length CHECK (char_length(content) <= 1000)
);

-- ==========================================
-- インデックス作成（posts）
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_uuid ON posts(uuid);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_public ON posts(is_public, is_deleted, created_at DESC) WHERE is_public = TRUE AND is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_user_public ON posts(user_id, is_public, is_deleted, created_at DESC);

-- 位置検索用の複合インデックス
CREATE INDEX IF NOT EXISTS idx_posts_location_time ON posts(latitude, longitude, created_at DESC) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_public = TRUE AND is_deleted = FALSE;

-- ==========================================
-- インデックス作成（likes）
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- ==========================================
-- インデックス作成（comments）
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id, created_at ASC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_uuid ON comments(uuid);

-- ==========================================
-- トリガー作成
-- ==========================================
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- いいね数更新のトリガー関数
-- ==========================================
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
DROP TRIGGER IF EXISTS trigger_update_likes_count ON likes;
CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- ==========================================
-- コメント数更新のトリガー関数
-- ==========================================
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 論理削除の場合のカウント調整
        IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
            UPDATE posts SET comments_count = comments_count - 1 WHERE id = NEW.post_id;
        ELSIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
            UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- コメント数更新トリガー
DROP TRIGGER IF EXISTS trigger_update_comments_count ON comments;
CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR DELETE OR UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- ==========================================
-- コメント追加（ドキュメント化）
-- ==========================================
COMMENT ON TABLE posts IS '投稿情報を管理するテーブル';
COMMENT ON TABLE likes IS 'いいね情報を管理するテーブル';
COMMENT ON TABLE comments IS 'コメント情報を管理するテーブル（階層コメント対応）';

COMMENT ON COLUMN posts.image_metadata IS '画像のメタデータ（幅、高さ、ファイルサイズなど）をJSON形式で保存';
COMMENT ON COLUMN posts.expires_at IS '自動削除機能：指定日時に投稿を自動削除';
COMMENT ON COLUMN comments.parent_id IS '返信コメントの場合、元コメントのID';

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ posts, likes, comments テーブルが正常に作成されました';
END $$;