// styles/GlobalStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ==========================================
// 🎨 カラーパレット（メインカラー定義）
// ==========================================
export const Colors = {
  // ✅ プライマリカラー（アプリのメインカラー）
  primary: '#111111',        // メインブルー
  primaryDark: '#2280E6',    // 濃いブルー（ボタン押下時など）
  primaryLight: '#66B3FF',   // 薄いブルー（背景など）
  
  // ✅ セカンダリカラー（アクセントカラー）
  secondary: '#FF6B6B',      // アクセント赤
  secondaryDark: '#E55555',  // 濃い赤
  secondaryLight: '#FF9999', // 薄い赤
  
  // ✅ ニュートラルカラー（グレースケール）
  background: '#F8F8F8',     // 背景色（薄いグレー）
  surface: '#FFFFFF',        // カード・ボックス背景（白）
  divider: '#E0E0E0',        // 区切り線
  border: '#CCCCCC',         // ボーダー
  
  // ✅ テキストカラー
  textPrimary: '#333333',    // メインテキスト（濃いグレー）
  textSecondary: '#666666',  // サブテキスト（中間グレー）
  textTertiary: '#999999',   // 補助テキスト（薄いグレー）
  textWhite: '#FFFFFF',      // 白テキスト
  
  // ✅ ステータスカラー
  success: '#4CAF50',        // 成功（緑）
  warning: '#FF9800',        // 警告（オレンジ）
  error: '#F44336',          // エラー（赤）
  info: '#2196F3',           // 情報（青）
  
  // ✅ 透明度カラー（オーバーレイなど）
  overlay: 'rgba(0, 0, 0, 0.5)',        // 半透明黒
  overlayLight: 'rgba(0, 0, 0, 0.3)',   // 薄い半透明黒
  shadowColor: 'rgba(0, 0, 0, 0.1)',    // 影色
};

// ==========================================
// 📏 サイズ・余白の定数
// ==========================================
export const Spacing = {
  // ✅ 基本余白（4の倍数で統一）
  xs: 4,    // 極小余白
  sm: 8,    // 小余白
  md: 16,   // 中余白（最も使用頻度高）
  lg: 24,   // 大余白
  xl: 32,   // 極大余白
  xxl: 48,  // 超大余白
  
  // ✅ 特殊余白
  headerHeight: 60,     // ヘッダー高さ
  tabBarHeight: 60,     // タブバー高さ
  statusBarHeight: 44,  // ステータスバー高さ（iOS）
  
  // ✅ 画面サイズ
  screenWidth,
  screenHeight,
};

// ==========================================
// 🔤 フォントサイズとウェイト
// ==========================================
export const Typography = {
  // ✅ フォントサイズ
  fontSize: {
    xs: 10,   // 極小テキスト
    sm: 12,   // 小テキスト（キャプション）
    md: 14,   // 中テキスト（本文）
    lg: 16,   // 大テキスト（見出し小）
    xl: 18,   // 極大テキスト（見出し中）
    xxl: 24,  // 超大テキスト（見出し大）
    title: 28, // タイトル
    hero: 32,  // ヒーローテキスト
  },
  
  // ✅ フォントウェイト
  fontWeight: {
    normal: 'normal' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: 'bold' as const,
  },
  
  // ✅ 行間
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// ==========================================
// 🔄 ボーダーラディウス（角丸）
// ==========================================
export const BorderRadius = {
  none: 0,
  sm: 4,     // 小さな角丸
  md: 8,     // 中間角丸
  lg: 12,    // 大きな角丸
  xl: 16,    // 極大角丸
  round: 50, // 完全な円形
};

// ==========================================
// 🌟 シャドウ（影）のプリセット
// ==========================================
export const Shadows = {
  // ✅ 小さな影
  small: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android用
  },
  
  // ✅ 中間の影
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4, // Android用
  },
  
  // ✅ 大きな影
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8, // Android用
  },
};

// ==========================================
// 🎯 よく使用するスタイルコンポーネント
// ==========================================
export const GlobalStyles = StyleSheet.create({
  // ✅ 基本コンテナ
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // ✅ 中央寄せコンテナ
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  // ✅ ヘッダー
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.statusBarHeight,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    ...Shadows.small,
  },
  
  // ✅ ヘッダータイトル
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  
  // ✅ カードコンテナ
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    ...Shadows.medium,
  },
  
  // ✅ ボタンスタイル
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // ✅ ボタンテキスト
  buttonTextPrimary: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  
  buttonTextSecondary: {
    color: Colors.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  
  // ✅ 入力フィールド
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  
  // ✅ フォーカス時の入力フィールド
  inputFocused: {
    borderColor: Colors.primary,
    ...Shadows.small,
  },
  
  // ✅ テキストスタイル
  textTitle: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.title * Typography.lineHeight.normal,
  },
  
  textHeading: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.xl * Typography.lineHeight.normal,
  },
  
  textBody: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
  },
  
  textCaption: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  
  // ✅ リストアイテム
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  
  // ✅ アバター
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
  },
  
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
  },
  
  // ✅ 区切り線
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  
  // ✅ ローディング
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  
  // ✅ エラーメッセージ
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  
  // ✅ 成功メッセージ
  successText: {
    color: Colors.success,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});

// ==========================================
// 🛠 ユーティリティ関数
// ==========================================
export const StyleUtils = {
  // ✅ マージンを動的に設定
  margin: (size: keyof typeof Spacing) => ({
    margin: Spacing[size],
  }),
  
  // ✅ パディングを動的に設定
  padding: (size: keyof typeof Spacing) => ({
    padding: Spacing[size],
  }),
  
  // ✅ 横マージンを動的に設定
  marginHorizontal: (size: keyof typeof Spacing) => ({
    marginHorizontal: Spacing[size],
  }),
  
  // ✅ 縦マージンを動的に設定
  marginVertical: (size: keyof typeof Spacing) => ({
    marginVertical: Spacing[size],
  }),
  
  // ✅ 横パディングを動的に設定
  paddingHorizontal: (size: keyof typeof Spacing) => ({
    paddingHorizontal: Spacing[size],
  }),
  
  // ✅ 縦パディングを動的に設定
  paddingVertical: (size: keyof typeof Spacing) => ({
    paddingVertical: Spacing[size],
  }),
  
  // ✅ 背景色を動的に設定
  backgroundColor: (color: keyof typeof Colors) => ({
    backgroundColor: Colors[color],
  }),
  
  // ✅ テキスト色を動的に設定
  textColor: (color: keyof typeof Colors) => ({
    color: Colors[color],
  }),
};

// ==========================================
// 📱 使用例（コメント）
// ==========================================
/*
// 🔥 使用例1: 基本的な画面レイアウト
<View style={GlobalStyles.container}>
  <View style={GlobalStyles.header}>
    <Text style={GlobalStyles.headerTitle}>マイページ</Text>
  </View>
  
  <View style={GlobalStyles.card}>
    <Text style={GlobalStyles.textHeading}>設定</Text>
    <Text style={GlobalStyles.textBody}>アカウント設定を変更できます</Text>
  </View>
</View>

// 🔥 使用例2: カスタムカラーを使用
<TouchableOpacity 
  style={[
    GlobalStyles.buttonPrimary, 
    { backgroundColor: Colors.secondary }
  ]}
>
  <Text style={GlobalStyles.buttonTextPrimary}>保存</Text>
</TouchableOpacity>

// 🔥 使用例3: ユーティリティ関数を使用
<View style={[
  GlobalStyles.card,
  StyleUtils.margin('lg'),
  StyleUtils.backgroundColor('surface')
]}>
  <Text style={[
    GlobalStyles.textBody,
    StyleUtils.textColor('textSecondary')
  ]}>
    この文章は薄いグレーで表示されます
  </Text>
</View>

// 🔥 使用例4: 独自のスタイルと組み合わせ
const customStyles = StyleSheet.create({
  specialButton: {
    ...GlobalStyles.buttonPrimary,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.xl,
  }
});
*/