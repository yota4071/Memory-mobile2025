// src/screens/ExploreScreen.tsx
import React, { useState, useEffect } from 'react'; // useEffectをインポート (将来的なAPI連携用)
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator, // ローディング表示用
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GlobalStyles,
  Colors,
  Spacing,
  Typography,
  BorderRadius,
} from '../styles/GlobalStyles';

// --- 型定義 ---
interface TagCategory {
  id: string;
  name: string;
}

interface RecommendedContent {
  id: string;
  imageUrl: string;
  // 将来的に検索対象となるプロパティ (例: title, description) を追加
  title?: string; // サンプルとして追加
}

// --- サンプルデータ ---
const sampleTags: TagCategory[] = [
  { id: 'tag1', name: '#風景' },
  { id: 'tag2', name: '#イラスト' },
  { id: 'tag3', name: '#猫' },
  { id: 'tag4', name: '#ポートレート' },
  { id: 'tag5', name: '#食べ物' },
  { id: 'tag6', name: '#旅行' },
  { id: 'tag7', name: '#アート' },
];

// サンプルデータに検索対象となりうるtitleプロパティを追加
const sampleRecommendedContentData: RecommendedContent[] = [
  { id: 'content1', imageUrl: 'https://picsum.photos/seed/main_large_v12/800/600', title: '雄大な橋と霧の風景' },
  { id: 'content2', imageUrl: 'https://picsum.photos/seed/grid_v12_1/300/300', title: '夕焼け空と雲' },
  { id: 'content3', imageUrl: 'https://picsum.photos/seed/grid_v12_2/300/300', title: 'モノクロの山並み' },
  { id: 'content4', imageUrl: 'https://picsum.photos/seed/grid_v12_3/300/300', title: '岩と空' },
  { id: 'content5', imageUrl: 'https://picsum.photos/seed/grid_v12_4/300/300', title: '森の中の光' },
  { id: 'content6', imageUrl: 'https://picsum.photos/seed/grid_v12_5/300/300', title: 'チューリップ畑' },
  { id: 'content7', imageUrl: 'https://picsum.photos/seed/grid_v12_6/300/300', title: '田園風景の小屋' },
  { id: 'content8', imageUrl: 'https://picsum.photos/seed/grid_v12_7/300/300', title: '月夜の砂漠' },
  { id: 'content9', imageUrl: 'https://picsum.photos/seed/grid_v12_8/300/300', title: '公園のベンチと紅葉' },
  { id: 'content10', imageUrl: 'https://picsum.photos/seed/grid_v12_9/300/300', title: '春の芽生え' },
];

const { width: screenWidth } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const SCREEN_HORIZONTAL_PADDING = Spacing.md;
const GRID_ITEM_HORIZONTAL_GAP = Spacing.xs;
const GRID_ITEM_VERTICAL_GAP = Spacing.xs;

const GRID_ITEM_WIDTH = (screenWidth - (SCREEN_HORIZONTAL_PADDING * 2) - (GRID_ITEM_HORIZONTAL_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  // 表示用データ。大きなアイテムは別途 largeContentItem で扱う
  const [displayedGridPosts, setDisplayedGridPosts] = useState<RecommendedContent[]>(sampleRecommendedContentData.slice(1));
  const [isSearching, setIsSearching] = useState(false); // フロントエンド検索中のローディング用

  // --- イベントハンドラ ---
  const handleMapIconPress = () => {
    console.log('[TODO] マップアイコンタップ: 地図探索画面へ遷移');
    // router.push('/explore/map');
  };

  const handleTagPress = (tag: TagCategory) => {
    console.log(`[TODO] タグ 「${tag.name}」 タップ: タグ別コンテンツ一覧画面へ遷移`);
    // router.push(`/explore/tag/${tag.id}`);
  };

  const handleContentPress = (content: RecommendedContent, isLargeItem: boolean = false) => {
    console.log(`[TODO] コンテンツID 「${content.id}」 (${isLargeItem ? '大' : '小'}) タップ: 詳細画面へ遷移`);
    // router.push(`/content/${content.id}`);
  };

  // --- フロントエンド検索ロジック ---
  const performSearch = (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    setIsSearching(true);

    if (!trimmedQuery) {
      setDisplayedGridPosts(sampleRecommendedContentData.slice(1)); // クエリが空なら初期グリッドデータに戻す
      setIsSearching(false);
      return;
    }

    // TODO (P1): より高度な検索ロジックを実装する
    // - 複数キーワード対応 (AND/OR)
    // - 検索対象プロパティの拡充 (現状は title のみ。将来的には説明文、ユーザー名など)
    // - API連携の場合は、API側で検索処理を行う
    console.log(`[TODO] フロントエンド検索実行: "${trimmedQuery}"`);
    const filteredPosts = sampleRecommendedContentData.slice(1).filter(post =>
      post.title?.toLowerCase().includes(trimmedQuery) || // タイトルで検索
      post.imageUrl.toLowerCase().includes(trimmedQuery)  // 画像URLでも一応検索 (デモ用)
    );
    setDisplayedGridPosts(filteredPosts);

    // 実際のAPI検索の場合は非同期になるため、適切なタイミングで setIsSearching(false) する
    setTimeout(() => setIsSearching(false), 500); // ダミーの遅延
  };

  const handleSubmitSearch = () => {
    performSearch(searchText);
  };


  // --- レンダー関数 ---
  const renderTagItem = ({ item }: { item: TagCategory }) => (
    <TouchableOpacity
      style={styles.tagItem}
      onPress={() => handleTagPress(item)}
    >
      <Text style={[GlobalStyles.textCaption, styles.tagTextOverride]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderGridContentItem = ({ item }: { item: RecommendedContent }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleContentPress(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridItemImage} />
    </TouchableOpacity>
  );

  const largeContentItem = sampleRecommendedContentData[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.searchBarArea}>
        <View style={styles.searchBarInputContainer}>
          <Ionicons name="search" size={Typography.fontSize.lg} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="キーワードを検索" // プレースホルダー変更
            placeholderTextColor={Colors.textTertiary} // より薄いプレースホルダー色
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
            clearButtonMode="while-editing" // iOSでクリアボタン表示
          />
        </View>
        <TouchableOpacity onPress={handleMapIconPress} style={styles.mapIconContainer}>
          <Ionicons name="map-outline" size={Typography.fontSize.xxl} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.tagsArea}>
              <FlatList
                data={sampleTags}
                renderItem={renderTagItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsListContainer}
              />
            </View>

            {largeContentItem && (
              <View style={styles.largeItemContainer}>
                <TouchableOpacity
                  style={styles.largeItem}
                  onPress={() => handleContentPress(largeContentItem, true)}
                >
                  <Image source={{ uri: largeContentItem.imageUrl }} style={styles.largeItemImage} />
                </TouchableOpacity>
              </View>
            )}

            {/* 検索中のローディング表示または結果なし表示 */}
            {isSearching && (
              <View style={styles.feedbackContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={[GlobalStyles.textCaption, styles.feedbackText]}>検索中...</Text>
              </View>
            )}
            {!isSearching && searchText.trim() !== '' && displayedGridPosts.length === 0 && (
              <View style={styles.feedbackContainer}>
                <Text style={[GlobalStyles.textBody, styles.feedbackText]}>
                  「{searchText}」に一致する結果は見つかりませんでした。
                </Text>
              </View>
            )}
          </>
        }
        data={displayedGridPosts}
        renderItem={renderGridContentItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        style={styles.contentGridStyle}
        contentContainerStyle={styles.contentGridContainerStyle}
        columnWrapperStyle={styles.rowStyle}
        showsVerticalScrollIndicator={false}
        // keyboardDismissMode="on-drag" // スクロールでキーボードを閉じる
        // keyboardShouldPersistTaps="handled" // TextInput以外をタップでキーボードを閉じる
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBarArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, // デザインに応じて区切り線を追加
    borderBottomColor: Colors.divider,
  },
  searchBarInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 40,
  },
  searchIcon: {
    marginRight: Spacing.xs, // 少し詰める
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs, // iOSでの入力フィールドの高さ調整
  },
  mapIconContainer: {
    paddingLeft: Spacing.sm,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  tagsArea: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, // デザインに応じて区切り線を追加
    borderBottomColor: Colors.divider,
  },
  tagsListContainer: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.xs,
  },
  tagItem: {
    backgroundColor: 'rgba(51, 153, 255, 0.1)', // Colors.primaryLight + '20' の代替 (GlobalStylesに定義推奨)
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xs, // 少し小さく
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(102, 179, 255, 0.3)', // Colors.primaryLight + '50' の代替 (GlobalStylesに定義推奨)
  },
  tagTextOverride: { // GlobalStyles.textCaption をベースに
    color: Colors.primary, // 色を少し明るく
    fontWeight: Typography.fontWeight.medium,
  },
  largeItemContainer: {
    marginBottom: Spacing.md, // 下のグリッドとの間隔
    // paddingHorizontal: SCREEN_HORIZONTAL_PADDING, // FlatListのcontentContainerStyleで制御するため不要
    // backgroundColor: Colors.background, // FlatListの背景に合わせる
  },
  largeItem: {
    width: screenWidth - SCREEN_HORIZONTAL_PADDING * 2, // 画面左右パディングを考慮
    height: screenWidth * 0.75, // 少し高さを出す (正方形に近い大きな画像に)
    alignSelf: 'center', // 中央寄せ
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.divider,
  },
  largeItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentGridStyle: {
    flex: 1,
  },
  contentGridContainerStyle: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.lg,
  },
  rowStyle: {
    justifyContent: 'space-between',
    marginBottom: GRID_ITEM_VERTICAL_GAP,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    aspectRatio: 1,
    backgroundColor: Colors.divider,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    // marginRight は不要 (columnWrapperStyleのjustifyContentで調整)
    // marginBottom は rowStyle で設定
  },
  gridItemImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  // --- フィードバック表示用スタイル ---
  feedbackContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100, // ある程度の高さを確保
  },
  feedbackText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});