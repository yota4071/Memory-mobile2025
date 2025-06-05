# Quick Start for Ubuntu24.04 and Other

1. clone This Repo.

2. update & upgrade
```bash
sudo apt update
sudo apt upgrade
```

3. install npm & node
```bash
sudo apt install nodejs npm -y
```

4. check version of npm & node
```bash
node -v
npm -v
```

5. At **PROJECT ROOT Directory** , DO this command
```bash
npm install
```
This command Install other dependences.

6. Change The Directory to **apps/mobile**
```bash
cd apps/mobile
```

7. Do solving Dependences
```bash
npm install
```

This Project is MonoRepo Project.
It's means "Use same repository between FrontEnd and BackEnd"

2025/05/28 23:17 Wakamiya
```bash
npx expo install expo-location react-native-maps
```

map用のライブラリインストールしてね💛


# 自動的にtag(バックアップ)を作ってpushしてくれるコード
### windows用
project rootの`tagmakeforwindows.bat`
```bash
 .\tagmakeforwindows.bat
```

### Mac用
project rootの`tag_create_for_Mac.sh`


# Memory Mobile 2025 - セットアップガイド

GPS位置情報を活用した周辺投稿SNSアプリの開発環境セットアップガイドです。

## 📋 必要な環境

### 必須ソフトウェア
- **Node.js** 18.x 以上
- **npm** 9.x 以上  
- **Docker Desktop**
- **Git**

### 推奨ソフトウェア
- **Visual Studio Code**
- **Expo CLI** (グローバルインストール)

## 🚀 初回セットアップ手順

### 1. リポジトリのクローン

```bash
# リポジトリをクローン
git clone <repository-url> Memory-mobile2025
cd Memory-mobile2025
```

了解です！
WSL＋Windows環境でDockerが起動しないケースに備えて、Docker Desktopの設定でUbuntuやDebian（WSLディストリビューション）を有効にする案内を追記した文章例を作りました。

---

### 2. Docker でデータベースを起動

```bash
# Docker Desktop が起動していることを確認
docker --version

# PostgreSQL コンテナを起動
cd apps/api
docker-compose up -d

# コンテナが起動していることを確認
docker ps
```

期待される出力：

```
CONTAINER ID   IMAGE         COMMAND                  CREATED         STATUS         PORTS                    NAMES
xxxxxxxxxxxx   postgres:15   "docker-entrypoint.s…"   X minutes ago   Up X minutes   0.0.0.0:5433->5432/tcp   api-postgres-1
```

---

#### 【補足】WSL＋Windows環境でDockerが起動しない場合

WSL（Windows Subsystem for Linux）を利用している場合、Docker Desktopの設定で使用するWSLディストリビューション（例：UbuntuやDebian）が有効になっているか確認してください。
有効になっていないとDockerが起動しなかったり、コンテナが正常に動作しないことがあります。

**設定手順（Docker Desktopの場合）**

1. Docker Desktopを開く
2. 左メニューから「Resources」→「WSL INTEGRATION」を選択
3. 利用しているWSLディストリビューション（例：Ubuntu、Debian）にチェックを入れて有効化する
4. 設定を保存し、Docker Desktopを再起動する

この設定を行うことで、WSL環境上でDockerがスムーズに動作します。

---

### 3. データベーススキーマの適用

```bash
# プロジェクトルートに移動
cd ../../

# スキーマファイルをコンテナにコピー
docker cp database/schema/complete_schema.sql api-postgres-1:/tmp/complete_schema.sql

# スキーマを適用
docker exec -it api-postgres-1 psql -U devuser -d memorydb -f /tmp/complete_schema.sql
```

### 4. データベース確認

```bash
# テーブルが正しく作成されているか確認
docker exec -it api-postgres-1 psql -U devuser -d memorydb -c "\dt"
```

期待される出力：
```
                List of relations
 Schema |   Name   | Type  |  Owner
--------+----------+-------+---------
 public | accounts | table | devuser
 public | comments | table | devuser
 public | likes    | table | devuser
 public | posts    | table | devuser
```

### 5. APIサーバーの設定

#### 5.1 依存関係のインストール

```bash
cd apps/api
npm install
```

#### 5.2 環境変数の設定

`apps/api/.env` ファイルを作成：

```env
# PostgreSQL接続設定（Docker用）
DB_HOST=localhost
DB_PORT=5433
DB_NAME=memorydb
DB_USER=devuser
DB_PASSWORD=devpass

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### 5.3 APIサーバーの起動

```bash
npx serverless offline
```

期待される出力：
```
✅ PostgreSQL（Docker）に接続しました
Server ready: http://0.0.0.0:3001 🚀
```

### 6. モバイルアプリの設定

#### 6.1 新しいターミナルを開く

APIサーバーは起動したまま、新しいターミナルで以下を実行：

```bash
cd apps/mobile
npm install
```

#### 6.2 IPアドレスの確認と設定

**Windows:**
```powershell
ipconfig | findstr "IPv4"
```

**Mac/Linux:**
```bash
ifconfig | grep inet
```

出力例：
```
IPv4 Address. . . . . . . . . . . : 192.168.1.150
```

#### 6.3 モバイルアプリの設定変更

`apps/mobile/src/contexts/AuthContext.tsx` の6行目付近を修正：

```typescript
const getApiBaseUrl = () => {
  return 'http://192.168.1.150:3001/dev'; // ← 自分のIPアドレスに変更
};
```

#### 6.4 モバイルアプリの起動

```bash
npm run start
```

期待される出力：
```
Metro waiting on exp://192.168.1.150:8081
› Press a │ open Android
› Press w │ open web
```

## 📱 モバイルアプリの動作確認

### 1. Expo Go アプリのインストール

スマートフォンに **Expo Go** アプリをインストール：
- **iOS**: App Store から「Expo Go」をインストール
- **Android**: Google Play Store から「Expo Go」をインストール

### 2. アプリの起動

1. スマートフォンとPCが**同じWiFiネットワーク**に接続されていることを確認
2. Expo Go アプリを開く
3. QRコードをスキャンまたは表示されたURLに接続

### 3. 新規登録テスト

1. アプリが起動すると認証画面が表示される
2. 「新規登録」タブを選択
3. 以下の情報を入力：
   - ユーザー名: testuser123
   - メールアドレス: test@example.com
   - パスワード: password123
   - 自己紹介: テストユーザーです
4. 「アカウント作成」ボタンをタップ
5. 成功するとメイン画面に遷移

## 🛠️ 開発時の操作

### APIサーバーの起動・停止

```bash
# APIサーバー起動
cd apps/api
npx serverless offline

# 停止: Ctrl+C
```

### モバイルアプリの起動・停止

```bash
# モバイルアプリ起動
cd apps/mobile
npm run start

# 停止: Ctrl+C
```

### データベース操作

```bash
# PostgreSQL に接続
docker exec -it api-postgres-1 psql -U devuser -d memorydb

# テーブル一覧表示
\dt

# ユーザー一覧表示
SELECT id, username, email, created_at FROM accounts;

# 終了
\q
```

### データベースのリセット

```bash
# データベースをリセット（全データ削除）
docker exec -it api-postgres-1 psql -U devuser -d memorydb -f /tmp/complete_schema.sql
```

## 🧪 API動作テスト（cURL）

### ヘルスチェック

```bash
curl http://localhost:3001/dev/health
```

### 新規登録テスト

```bash
curl -X POST http://localhost:3001/dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apitest",
    "email": "apitest@example.com",
    "password": "password123",
    "bio": "API経由のテスト"
  }'
```

### ログインテスト

```bash
curl -X POST http://localhost:3001/dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "password123"
  }'
```

## 🚨 トラブルシューティング

### よくある問題と解決法

#### 1. Docker コンテナが起動しない

**エラー**: `docker: Error response from daemon`

**解決法**:
```bash
# Docker Desktop が起動しているか確認
# 既存のコンテナを削除してやり直し
docker rm -f api-postgres-1
docker-compose up -d
```

#### 2. APIサーバーが起動しない

**エラー**: `bcrypt` 関連のエラー

**解決法**:
```bash
cd apps/api
rm -rf node_modules package-lock.json
npm install
```

#### 3. モバイルアプリが接続できない

**エラー**: "Network request failed"

**解決法**:
1. PCとスマートフォンが同じWiFiに接続されているか確認
2. `AuthContext.tsx` のIPアドレスが正しいか確認
3. Windows Defender ファイアウォールの設定確認

#### 4. データベース接続エラー

**エラー**: "column does not exist"

**解決法**:
```bash
# スキーマを再適用
docker exec -it api-postgres-1 psql -U devuser -d memorydb -f /tmp/complete_schema.sql
```

## 📊 プロジェクト構造

```
Memory-mobile2025/
├── apps/
│   ├── mobile/              # React Native モバイルアプリ
│   │   ├── src/
│   │   │   ├── contexts/    # 認証コンテキスト
│   │   │   ├── screens/     # 画面コンポーネント
│   │   │   └── styles/      # スタイル定義
│   │   └── app/             # ルーティング
│   └── api/                 # Node.js APIサーバー
│       ├── src/
│       │   ├── routes/      # APIルート
│       │   └── index.ts     # メインファイル
│       └── .env             # 環境変数
├── database/
│   └── schema/
│       └── complete_schema.sql  # データベーススキーマ
└── README.md
```

## 🎯 利用可能な機能

### 現在実装済み
- ✅ ユーザー新規登録
- ✅ ログイン・ログアウト
- ✅ JWT認証
- ✅ パスワードハッシュ化
- ✅ 基本的なバリデーション

### 今後実装予定
- 📍 GPS位置情報取得
- 📝 投稿機能
- 🗺️ 地図表示
- ❤️ いいね機能
- 💬 コメント機能

## 🔗 API エンドポイント

| 機能 | メソッド | エンドポイント |
|------|----------|----------------|
| ヘルスチェック | GET | `/dev/health` |
| 新規登録 | POST | `/dev/api/auth/register` |
| ログイン | POST | `/dev/api/auth/login` |
| ユーザー情報取得 | GET | `/dev/api/auth/me` |

## 👥 チーム開発時の注意点

### 1. 環境変数は共有しない
- `.env` ファイルは `.gitignore` に含まれています
- 各自が自分のIPアドレスを設定してください

### 2. データベースの状態
- 開発中はローカルのDockerコンテナを使用
- データは各自のローカル環境のみに保存されます

### 3. ポート番号
- API: 3001番ポート
- PostgreSQL: 5433番ポート
- Expo: 8081番ポート

### 4. Git での協業
```bash
# 作業前に最新状態を取得
git pull origin main

# 新しいブランチで作業
git checkout -b feature/新機能名

# 作業完了後
git add .
git commit -m "機能: 新機能の説明"
git push origin feature/新機能名
```

## 📞 サポート

質問や問題が発生した場合は、以下の情報と一緒にチームメンバーに連絡してください：

1. **エラーメッセージ** (完全なログ)
2. **実行した手順**
3. **環境情報** (OS、Node.jsバージョンなど)
4. **スクリーンショット** (必要に応じて)

---

**🎉 セットアップ完了！** 

開発環境が正しく構築されていれば、認証機能付きのモバイルアプリが動作するはずです。何か問題があれば、上記のトラブルシューティングを参考にしてください。




# grobalなcss(ts)の場所
基本的にreact nativeではcssは使えないのでそれ用のtsを用意しました。**apps/mobile/src/styles**に入っています

使い方

# 🎨 グローバルスタイルガイド - チーム開発者向け

## 📋 概要
このドキュメントは、LocalSNSアプリのデザインシステムとグローバルスタイルの使用方法をまとめたものです。統一されたデザインを保持し、開発効率を向上させるために作成されました。

## 🚀 クイックスタート

### 1. インポート方法
```typescript
import { 
  GlobalStyles,    // 共通スタイル
  Colors,          // 色定数
  Spacing,         // 余白定数
  Typography,      // フォント定数
  BorderRadius,    // 角丸定数
  Shadows,         // 影定数
  StyleUtils       // ユーティリティ関数
} from '../styles/GlobalStyles';
```

### 2. 基本的な画面構成
```typescript
export default function MyScreen() {
  return (
    <View style={GlobalStyles.container}>
      {/* ヘッダー */}
      <View style={GlobalStyles.header}>
        <Text style={GlobalStyles.headerTitle}>画面タイトル</Text>
      </View>
      
      {/* メインコンテンツ */}
      <View style={GlobalStyles.card}>
        <Text style={GlobalStyles.textHeading}>見出し</Text>
        <Text style={GlobalStyles.textBody}>本文テキスト</Text>
      </View>
    </View>
  );
}
```

## 🎨 カラーパレット使用方法

### メインカラー
```typescript
// ✅ 推奨：定数を使用
backgroundColor: Colors.primary,      // #3399FF
color: Colors.textPrimary,           // #333333

// ❌ 非推奨：直接カラーコードを記述
backgroundColor: '#3399FF',
color: '#333333',
```

### 利用可能な色
- **Primary**: `Colors.primary`, `Colors.primaryDark`, `Colors.primaryLight`
- **Secondary**: `Colors.secondary`, `Colors.secondaryDark`, `Colors.secondaryLight`
- **Background**: `Colors.background`, `Colors.surface`
- **Text**: `Colors.textPrimary`, `Colors.textSecondary`, `Colors.textTertiary`
- **Status**: `Colors.success`, `Colors.warning`, `Colors.error`, `Colors.info`

## 📏 スペーシング（余白）の使用方法

### 基本的な使用
```typescript
// ✅ 推奨：定数を使用
padding: Spacing.md,           // 16px
marginVertical: Spacing.sm,    // 8px

// ❌ 非推奨：直接数値を記述
padding: 16,
marginVertical: 8,
```

### 利用可能なサイズ
- `Spacing.xs` (4px) - 極小余白
- `Spacing.sm` (8px) - 小余白
- `Spacing.md` (16px) - 中余白 **最頻使用**
- `Spacing.lg` (24px) - 大余白
- `Spacing.xl` (32px) - 極大余白

## 🔤 テキストスタイルの使用方法

### 基本的なテキスト
```typescript
<Text style={GlobalStyles.textTitle}>タイトル</Text>
<Text style={GlobalStyles.textHeading}>見出し</Text>
<Text style={GlobalStyles.textBody}>本文</Text>
<Text style={GlobalStyles.textCaption}>キャプション</Text>
```

### 色付きテキスト
```typescript
<Text style={[
  GlobalStyles.textBody,
  StyleUtils.textColor('textSecondary')
]}>
  グレーのテキスト
</Text>
```

## 🔳 ボタンの使用方法

### プライマリボタン
```typescript
<TouchableOpacity style={GlobalStyles.buttonPrimary}>
  <Text style={GlobalStyles.buttonTextPrimary}>保存</Text>
</TouchableOpacity>
```

### セカンダリボタン
```typescript
<TouchableOpacity style={GlobalStyles.buttonSecondary}>
  <Text style={GlobalStyles.buttonTextSecondary}>キャンセル</Text>
</TouchableOpacity>
```

### カスタムカラーボタン
```typescript
<TouchableOpacity style={[
  GlobalStyles.buttonPrimary,
  { backgroundColor: Colors.secondary }
]}>
  <Text style={GlobalStyles.buttonTextPrimary}>削除</Text>
</TouchableOpacity>
```

## 📦 カードレイアウトの使用方法

### 基本的なカード
```typescript
<View style={GlobalStyles.card}>
  <Text style={GlobalStyles.textHeading}>カードタイトル</Text>
  <Text style={GlobalStyles.textBody}>カード内容</Text>
</View>
```

### カスタマイズされたカード
```typescript
<View style={[
  GlobalStyles.card,
  StyleUtils.margin('lg'),
  { borderLeftWidth: 4, borderLeftColor: Colors.primary }
]}>
  <Text style={GlobalStyles.textBody}>重要なお知らせ</Text>
</View>
```

## 🛠 ユーティリティ関数の使用方法

### マージン・パディング
```typescript
<View style={[
  GlobalStyles.card,
  StyleUtils.margin('lg'),              // margin: 24
  StyleUtils.paddingHorizontal('md'),   // paddingHorizontal: 16
]}>
```

### 背景色・テキスト色
```typescript
<View style={[
  GlobalStyles.card,
  StyleUtils.backgroundColor('surface'),
]}>
  <Text style={[
    GlobalStyles.textBody,
    StyleUtils.textColor('textSecondary')
  ]}>
    カスタムカラーテキスト
  </Text>
</View>
```

## 📱 よくある画面パターン

### 1. リスト画面
```typescript
const renderItem = ({ item }) => (
  <View style={GlobalStyles.card}>
    <View style={GlobalStyles.listItem}>
      <Image style={GlobalStyles.avatar} source={{ uri: item.avatar }} />
      <View style={{ flex: 1 }}>
        <Text style={GlobalStyles.textBody}>{item.name}</Text>
        <Text style={GlobalStyles.textCaption}>{item.description}</Text>
      </View>
    </View>
  </View>
);
```

### 2. フォーム画面
```typescript
<View style={GlobalStyles.container}>
  <View style={GlobalStyles.header}>
    <Text style={GlobalStyles.headerTitle}>プロフィール編集</Text>
  </View>
  
  <View style={[GlobalStyles.card, StyleUtils.margin('md')]}>
    <TextInput 
      style={GlobalStyles.input}
      placeholder="名前を入力"
      placeholderTextColor={Colors.textTertiary}
    />
    
    <TouchableOpacity style={[
      GlobalStyles.buttonPrimary,
      StyleUtils.marginVertical('md')
    ]}>
      <Text style={GlobalStyles.buttonTextPrimary}>保存</Text>
    </TouchableOpacity>
  </View>
</View>
```

### 3. エラー・ローディング画面
```typescript
// ローディング
<View style={GlobalStyles.loadingContainer}>
  <ActivityIndicator size="large" color={Colors.primary} />
  <Text style={GlobalStyles.loadingText}>読み込み中...</Text>
</View>

// エラーメッセージ
<Text style={GlobalStyles.errorText}>
  エラーが発生しました
</Text>
```

## ⚠️ 注意事項とベストプラクティス

### ✅ 推奨事項
1. **常にグローバルスタイルを最初に検討する**
2. **色は`Colors`オブジェクトから参照する**
3. **余白は`Spacing`定数を使用する**
4. **カスタムスタイルは最小限に抑える**
5. **`StyleUtils`を活用して動的スタイリング**

### ❌ 避けるべき事項
1. **直接カラーコードを記述する**
2. **固定の数値で余白を設定する**
3. **同じようなスタイルを画面ごとに再定義する**
4. **グローバルスタイルを無視した独自デザイン**

## 🔧 カスタマイズが必要な場合

### 個別スタイルの追加
```typescript
const styles = StyleSheet.create({
  customButton: {
    ...GlobalStyles.buttonPrimary,  // ベースを継承
    borderRadius: BorderRadius.round,  // カスタマイズ
    paddingHorizontal: Spacing.xl,
  },
});
```

### グローバルスタイルの拡張
```typescript
<TouchableOpacity style={[
  GlobalStyles.buttonPrimary,
  { 
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.successDark 
  }
]}>
  <Text style={GlobalStyles.buttonTextPrimary}>成功ボタン</Text>
</TouchableOpacity>
```

## 🎯 まとめ

このグローバルスタイルシステムを使用することで：

- **統一されたデザイン** - アプリ全体で一貫した見た目
- **開発効率の向上** - 再利用可能なスタイルで時間短縮
- **保守性の向上** - 色やサイズの変更が一箇所で済む
- **チーム協力の促進** - 共通のデザイン言語

質問や追加要望があれば、チームチャットまたはissueで相談してください！
