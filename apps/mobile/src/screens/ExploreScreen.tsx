// src/screens/ExploreScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GlobalStyles,
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  StyleUtils
} from '../styles/GlobalStyles';

// 探索カテゴリの型定義
interface ExploreCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
}

// トレンド投稿の型定義
interface TrendingPost {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  location: string;
  avatar?: string;
  image?: string;
}

// 探索カテゴリのサンプルデータ
const exploreCategories: ExploreCategory[] = [
  {
    id: '1',
    title: 'グルメ',
    icon: 'restaurant',
    color: '#FF6B6B',
    count: 1247
  },
  {
    id: '2',
    title: 'イベント',
    icon: 'calendar',
    color: '#4ECDC4',
    count: 892
  },
  {
    id: '3',
    title: '観光',
    icon: 'camera',
    color: '#45B7D1',
    count: 634
  },
  {
    id: '4',
    title: 'ショッピング',
    icon: 'bag',
    color: '#96CEB4',
    count: 523
  },
  {
    id: '5',
    title: 'アート',
    icon: 'color-palette',
    color: '#FECA57',
    count: 389
  },
  {
    id: '6',
    title: '自然',
    icon: 'leaf',
    color: '#48CAE4',
    count: 756
  }
];

// トレンド投稿のサンプルデータ
const trendingPosts: TrendingPost[] = [
  {
    id: '1',
    username: 'TokyoFoodie',
    content: '新宿で見つけた隠れ家ラーメン店。スープが絶品です！',
    timestamp: '1時間前',
    likes: 156,
    comments: 23,
    location: '新宿区',
    avatar: 'https://i.pravatar.cc/50?img=6',
    image: 'https://picsum.photos/300/200?random=1'
  },
  {
    id: '2',
    username: 'ArtLover_Shibuya',
    content: '渋谷の新しいアート展示がすごい！現代アートの新しい形を見ることができました。',
    timestamp: '2時間前',
    likes: 89,
    comments: 12,
    location: '渋谷区',
    avatar: 'https://i.pravatar.cc/50?img=7',
    image: 'https://picsum.photos/300/200?random=2'
  },
  {
    id: '3',
    username: 'NatureWalker',
    content: '上野公園の桜が見頃です。朝の散歩で撮影しました。',
    timestamp: '3時間前',
    likes: 234,
    comments: 45,
    location: '台東区',
    avatar: 'https://i.pravatar.cc/50?img=8',
    image: 'https://picsum.photos/300/200?random=3'
  }
];

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<TrendingPost[]>(trendingPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 検索処理
  const handleSearch = (text: string) => {
    setSearchText(text);
    // 実際のアプリでは、ここでAPIを呼び出して検索結果を取得
    console.log('検索:', text);
  };

  // カテゴリ選択処理
  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
    // 実際のアプリでは、カテゴリに基づいて投稿をフィルタリング
    console.log('選択されたカテゴリ:', categoryId);
  };

  // 投稿の更新処理
  const onRefresh = async () => {
    setRefreshing(true);
    // 実際のアプリでは、最新の投稿を取得
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // カテゴリアイテムの描画
  const renderCategory = ({ item }: { item: ExploreCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected,
        { borderColor: item.color }
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={20} color="white" />
      </View>
      <Text style={[
        GlobalStyles.textCaption,
        selectedCategory === item.id && styles.categoryTextSelected
      ]}>
        {item.title}
      </Text>
      <Text style={[GlobalStyles.textCaption, { color: Colors.textTertiary }]}>
        {item.count}
      </Text>
    </TouchableOpacity>
  );

  // トレンド投稿アイテムの描画
  const renderTrendingPost = ({ item }: { item: TrendingPost }) => (
    <TouchableOpacity style={[GlobalStyles.card, styles.trendingPost]}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.avatar || 'https://i.pravatar.cc/50?img=9' }}
          style={GlobalStyles.avatar}
        />
        <View style={styles.postInfo}>
          <Text style={[GlobalStyles.textBody, { fontWeight: '600' }]}>
            {item.username}
          </Text>
          <Text style={[GlobalStyles.textCaption, { color: Colors.textSecondary }]}>
            {item.location} • {item.timestamp}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[GlobalStyles.textBody, StyleUtils.marginVertical('sm')]}>
        {item.content}
      </Text>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={Colors.textSecondary} />
          <Text style={[GlobalStyles.textCaption, StyleUtils.marginHorizontal('xs')]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={[GlobalStyles.textCaption, StyleUtils.marginHorizontal('xs')]}>
            {item.comments}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
          <Text style={[GlobalStyles.textCaption, StyleUtils.marginHorizontal('xs')]}>
            シェア
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={GlobalStyles.container}>
      {/* ヘッダー */}
      <View style={GlobalStyles.header}>
        <Text style={GlobalStyles.headerTitle}>探索</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="filter" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 検索バー */}
      <View style={[StyleUtils.backgroundColor('surface'), StyleUtils.paddingHorizontal('md')]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="場所やキーワードで検索..."
            placeholderTextColor={Colors.textSecondary}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {/* カテゴリセクション */}
            <View style={StyleUtils.paddingVertical('md')}>
              <Text style={[
                GlobalStyles.textHeading,
                StyleUtils.paddingHorizontal('md'),
                StyleUtils.marginVertical('sm')
              ]}>
                カテゴリ
              </Text>
              <FlatList
                data={exploreCategories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={StyleUtils.paddingHorizontal('sm')}
              />
            </View>

            {/* トレンドセクション */}
            <View style={StyleUtils.paddingVertical('sm')}>
              <Text style={[
                GlobalStyles.textHeading,
                StyleUtils.paddingHorizontal('md'),
                StyleUtils.marginVertical('sm')
              ]}>
                トレンド投稿
              </Text>
            </View>
          </View>
        }
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderTrendingPost}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: Spacing.xs,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.sm,
    ...Shadows.small,
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },

  clearButton: {
    padding: Spacing.xs,
  },

  categoryItem: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.small,
  },

  categoryItemSelected: {
    backgroundColor: Colors.primaryLight + '20',
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },

  categoryTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },

  trendingPost: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  postInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },

  moreButton: {
    padding: Spacing.xs,
  },

  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },

  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: Spacing.sm,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});