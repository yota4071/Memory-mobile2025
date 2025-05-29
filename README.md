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