// src/screens/HomeScreen.tsx - 改善版
import React, { useState, useEffect, useRef } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
  PanResponder
} from 'react-native';

// Expo用のマップコンポーネント
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// グローバルスタイルをインポート
import { 
  GlobalStyles, 
  Colors, 
  Spacing, 
  Typography, 
  BorderRadius, 
  Shadows,
  StyleUtils 
} from '../styles/GlobalStyles';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 80;
const HANDLE_HEIGHT = 40;
const POSTS_HEADER_HEIGHT = 60;
const TAB_BAR_HEIGHT = 60; // タブバーの高さを追加

// パネルの最小・最大高さ
const MIN_PANEL_HEIGHT = SCREEN_HEIGHT * 0.3; // 画面の30%
const MAX_PANEL_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT - 20; // タブバーを考慮

// パネル状態の定義
enum PanelState {
  COLLAPSED = 'COLLAPSED', // 最小
  HALF = 'HALF',          // 中間
  EXPANDED = 'EXPANDED'    // 最大
}

// 各状態の高さを計算
const getPanelHeight = (state: PanelState): number => {
  switch (state) {
    case PanelState.COLLAPSED:
      return MIN_PANEL_HEIGHT;
    case PanelState.HALF:
      return SCREEN_HEIGHT * 0.5; // 画面の50%
    case PanelState.EXPANDED:
      return MAX_PANEL_HEIGHT;
    default:
      return MIN_PANEL_HEIGHT;
  }
};

// 環境変数から設定を取得
const getConfigValue = (key: string, defaultValue: string = ''): string => {
  const expoConfigValue = Constants.expoConfig?.extra?.[key];
  if (expoConfigValue) {
    return expoConfigValue;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    const envValue = process.env[`EXPO_PUBLIC_${key.toUpperCase()}`];
    if (envValue) {
      return envValue;
    }
  }
  
  return defaultValue;
};

// アプリ設定
const AppConfig = {
  googleMapsApiKey: getConfigValue('googleMapsApiKey'),
  apiBaseUrl: getConfigValue('apiBaseUrl', 'http://localhost:3000'),
  environment: getConfigValue('environment', 'development'),
  debugMode: getConfigValue('debugMode', 'false') === 'true',
};

// 投稿データの型定義
interface Post {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  likes: number;
  distance: number;
  avatar?: string;
}

// サンプルデータ（大阪周辺）
const samplePosts: Post[] = [
  {
    id: '1',
    username: 'Osaka_Walker',
    content: '梅田のカフェで美味しいコーヒーを発見しました！',
    timestamp: '2分前',
    latitude: 34.7024,
    longitude: 135.4959,
    likes: 12,
    distance: 50,
    avatar: 'https://i.pravatar.cc/50?img=1'
  },
  {
    id: '2', 
    username: 'TechOsaka',
    content: '難波でプログラミング勉強会開催中です。みなさんもぜひ！',
    timestamp: '5分前',
    latitude: 34.6660,
    longitude: 135.5007,
    likes: 8,
    distance: 120,
    avatar: 'https://i.pravatar.cc/50?img=2'
  },
  {
    id: '3',
    username: 'FoodieDotombori',
    content: '道頓堀でたこ焼きの食べ比べ中です。どれも美味しい！',
    timestamp: '10分前',
    latitude: 34.6690,
    longitude: 135.5037,
    likes: 25,
    distance: 200,
    avatar: 'https://i.pravatar.cc/50?img=3'
  },
  {
    id: '4',
    username: 'ParkLover',
    content: '大阪城公園で桜が綺麗に咲いています。見頃です！',
    timestamp: '15分前',
    latitude: 34.6873,
    longitude: 135.5262,
    likes: 18,
    distance: 350,
    avatar: 'https://i.pravatar.cc/50?img=4'
  },
  {
    id: '5',
    username: 'CafeHunter',
    content: '心斎橋の隠れ家カフェで絶品スイーツ発見！',
    timestamp: '20分前',
    latitude: 34.6751,
    longitude: 135.5025,
    likes: 31,
    distance: 420,
    avatar: 'https://i.pravatar.cc/50?img=5'
  },
];

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>(PanelState.HALF);
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // 選択されたユーザー
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(samplePosts); // フィルタされた投稿
  const [isTransitioning, setIsTransitioning] = useState(false); // トランジション状態
  
  const mapRef = useRef<MapView>(null);
  const panelAnimation = useRef(new Animated.Value(getPanelHeight(PanelState.HALF))).current;
  
  // パンレスポンダーの設定
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dy, dx } = gestureState;
        // 縦方向の動きが横方向より大きい場合にパンを開始
        return Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10;
      },
      onPanResponderGrant: () => {
        // パン開始時に現在の値を設定
        panelAnimation.setOffset(panelAnimation._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        // 逆方向の動き（上に引っ張ると値が増える）
        panelAnimation.setValue(-gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        panelAnimation.flattenOffset();
        
        const { dy, vy } = gestureState;
        const currentHeight = panelAnimation._value;
        
        let targetState = panelState;
        
        // 速度による判定
        if (Math.abs(vy) > 0.5) {
          if (vy < 0) {
            // 上方向の勢い
            targetState = panelState === PanelState.COLLAPSED ? PanelState.HALF : PanelState.EXPANDED;
          } else {
            // 下方向の勢い
            targetState = panelState === PanelState.EXPANDED ? PanelState.HALF : PanelState.COLLAPSED;
          }
        } else {
          // 距離による判定
          const threshold = 50;
          if (dy < -threshold) {
            // 上に移動
            targetState = panelState === PanelState.COLLAPSED ? PanelState.HALF : PanelState.EXPANDED;
          } else if (dy > threshold) {
            // 下に移動
            targetState = panelState === PanelState.EXPANDED ? PanelState.HALF : PanelState.COLLAPSED;
          }
        }
        
        animateToState(targetState);
      },
    })
  ).current;

  // 指定状態にアニメーション
  const animateToState = (newState: PanelState) => {
    const toValue = getPanelHeight(newState);
    
    Animated.spring(panelAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start(() => {
      setPanelState(newState);
    });
  };

  useEffect(() => {
    initializeApp();
  }, []);

  // アプリ初期化
  const initializeApp = async () => {
    try {
      if (AppConfig.debugMode) {
        console.log('🚀 アプリを初期化中...');
      }
      await requestLocationPermission();
    } catch (error) {
      console.error('アプリ初期化エラー:', error);
      setError('アプリの初期化に失敗しました');
      setIsLoading(false);
    }
  };

  // 位置情報の権限を要求
  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          '位置情報の権限が必要です',
          'このアプリでは周辺の投稿を表示するために位置情報が必要です。',
          [
            { 
              text: 'デフォルト位置を使用', 
              onPress: () => {
                setUserLocation({
                  latitude: 34.7024, // 大阪梅田
                  longitude: 135.4959
                });
                setIsLoading(false);
              }
            },
            { 
              text: '権限を許可', 
              onPress: () => requestLocationPermission()
            }
          ]
        );
        return;
      }

      setHasLocationPermission(true);
      await getCurrentLocation();
      
    } catch (error) {
      console.error('権限要求エラー:', error);
      Alert.alert('エラー', '位置情報の権限取得に失敗しました。デフォルト位置を使用します。');
      setUserLocation({
        latitude: 34.7024, // 大阪梅田
        longitude: 135.4959
      });
      setIsLoading(false);
    }
  };

  // 現在位置を取得
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setIsLoading(false);
      
    } catch (error) {
      console.error('現在位置取得エラー:', error);
      Alert.alert(
        '位置情報取得エラー',
        'デフォルト位置（大阪梅田）を使用します。',
        [{ text: 'OK' }]
      );
      
      setUserLocation({
        latitude: 34.7024, // 大阪梅田
        longitude: 135.4959
      });
      setIsLoading(false);
    }
  };

  // マーカータップ時の処理
  const handleMarkerPress = (post: Post) => {
    console.log(`マーカータップ: ${post.username}`);
    
    // 選択されたユーザーの投稿のみをフィルタ
    const userPosts = posts.filter(p => p.username === post.username);
    setFilteredPosts(userPosts);
    setSelectedUser(post.username);
    
    // パネルを半分の大きさに設定
    animateToState(PanelState.HALF);
    
    // マップを該当位置に移動
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: post.latitude,
        longitude: post.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  // フィルタをクリアして全投稿を表示
  const clearFilter = () => {
    setIsTransitioning(true);
    setFilteredPosts(posts);
    
    // 滑らかなトランジションのため段階的に更新
    setTimeout(() => {
      setSelectedUser(null);
    }, 150);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // 地図上の位置に移動
  const moveToLocation = (latitude: number, longitude: number) => {
    // パネルを縮小してマップを見やすくする
    if (panelState === PanelState.EXPANDED) {
      animateToState(PanelState.HALF);
    }
    
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }, panelState === PanelState.EXPANDED ? 300 : 0);
  };

  // 投稿アイテムレンダリング
  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: item.avatar || 'https://i.pravatar.cc/50?img=5' }}
            style={styles.avatar}
          />
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>{item.timestamp} • {item.distance}m</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.error }]}>
            <Ionicons name="heart-outline" size={16} color={Colors.textWhite} />
          </View>
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.info }]}>
            <Ionicons name="chatbubble-outline" size={16} color={Colors.textWhite} />
          </View>
          <Text style={styles.actionText}>返信</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => moveToLocation(item.latitude, item.longitude)}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
            <Ionicons name="location-outline" size={16} color={Colors.textWhite} />
          </View>
          <Text style={styles.actionText}>位置</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // パネル状態に応じたヒントテキスト
  const getSwipeHint = (): string => {
    switch (panelState) {
      case PanelState.COLLAPSED:
        return '上にスワイプして展開';
      case PanelState.HALF:
        return '上下にスワイプして調整';
      case PanelState.EXPANDED:
        return '下にスワイプして縮小';
      default:
        return '';
    }
  };

  // ローディング画面
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {hasLocationPermission ? '位置情報を取得中...' : '権限を確認中...'}
        </Text>
      </View>
    );
  }

  // エラー画面
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorTitle}>エラーが発生しました</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeApp}>
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Balloon</Text>
            {AppConfig.debugMode && (
              <Text style={styles.debugBadge}>{AppConfig.environment}</Text>
            )}
          </View>
          {/*<TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              // TODO: 新しい投稿作成画面へのナビゲーション
              Alert.alert('新しい投稿', '投稿作成機能は実装予定です');
            }}
          >
            <View style={styles.addButtonInner}>
              <Ionicons name="add" size={24} color={Colors.textWhite} />
            </View>
          </TouchableOpacity>*/}
        </View>
      </View>

      {/* マップ部分 */}
      <View style={styles.mapWrapper}>
        <Animated.View 
          style={[
            styles.mapContainer,
            {
              height: Animated.subtract(
                SCREEN_HEIGHT - HEADER_HEIGHT,
                panelAnimation
              )
            }
          ]}
        >
          {userLocation ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={hasLocationPermission}
              showsMyLocationButton={false}
              showsCompass={true}
            >
              {/* デフォルト位置のマーカー */}
              {!hasLocationPermission && (
                <Marker
                  coordinate={userLocation}
                  title="デフォルト位置"
                  description="大阪梅田"
                  pinColor={Colors.primary}
                />
              )}
              
              {/* 投稿のマーカー */}
              {posts.map((post) => {
                const isSelected = selectedUser === post.username;
                return (
                  <Marker
                    key={`${post.id}-${isSelected}`} // keyにselected状態を含める
                    coordinate={{
                      latitude: post.latitude,
                      longitude: post.longitude,
                    }}
                    title={post.username}
                    description={post.content.substring(0, 50) + '...'}
                    onPress={() => handleMarkerPress(post)}
                    tracksViewChanges={false} // 不要な再レンダリングを防ぐ
                  >
                    <View style={[
                      styles.customMarker,
                      isSelected && styles.selectedMarker
                    ]}>
                      <Image 
                        source={{ uri: post.avatar || 'https://i.pravatar.cc/30?img=5' }}
                        style={styles.markerAvatar}
                      />
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Ionicons name="location-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.mapPlaceholderText}>位置情報を取得できませんでした</Text>
            </View>
          )}
          
          {/* フローティングボタン（横並び） */}
          <View style={styles.floatingButtonContainer}>
            <TouchableOpacity 
              style={[styles.floatingButton, styles.refreshButton]} 
              onPress={() => getCurrentLocation()}
            >
              <View style={styles.floatingButtonInner}>
                <Ionicons name="refresh" size={20} color={Colors.textWhite} />
              </View>
            </TouchableOpacity>
            
            {userLocation && (
              <TouchableOpacity 
                style={[styles.floatingButton, styles.myLocationButton]}
                onPress={() => {
                  if (mapRef.current && userLocation) {
                    mapRef.current.animateToRegion({
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    }, 1000);
                  }
                }}
              >
                <View style={styles.myLocationButtonInner}>
                  <Ionicons name="navigate" size={20} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>

      {/* スライド可能な投稿パネル */}
      <Animated.View 
        style={[
          styles.postsPanel,
          {
            height: panelAnimation,
          }
        ]}
      >
        {/* パネルハンドル */}
        <View style={styles.panelHandle} {...panResponder.panHandlers}>
          <View style={styles.handleBar} />
          <Text style={styles.swipeHint}>{getSwipeHint()}</Text>
        </View>

        {/* 投稿ヘッダー */}
        <View style={styles.postsHeader}>
          <View style={styles.postsHeaderLeft}>
            <Text style={styles.postsTitle}>
              {selectedUser ? `${selectedUser}の投稿` : '周辺の投稿'}
            </Text>
            <View style={styles.postsBadge}>
              <Text style={styles.postsBadgeText}>{filteredPosts.length}</Text>
            </View>
            {selectedUser && (
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={clearFilter}
              >
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                <Text style={styles.clearFilterText}>すべて表示</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="filter" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerActionButton, { marginLeft: Spacing.xs }]}>
              <Ionicons name="refresh" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 投稿リスト */}
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          style={styles.postsList}
          contentContainerStyle={styles.postsListContent}
          scrollEnabled={panelState !== PanelState.COLLAPSED}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // ローディング・エラー
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  retryButtonText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },

  // ヘッダー
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: Colors.primary,
    paddingTop: Spacing.statusBarHeight,
    ...Shadows.medium,
    zIndex: 1000, // ヘッダーを前面に表示
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
  },
  debugBadge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.sm,
    fontSize: Typography.fontSize.xs,
    color: Colors.textWhite,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  addButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary, // 赤い背景に変更
    borderRadius: BorderRadius.round,
  },

  // マップ
  mapWrapper: {
    flex: 1,
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  mapPlaceholderText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },

  // フローティングボタン
  floatingButtonContainer: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 200,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.xs, // 横並び用の左マージン
    ...Shadows.large,
  },
  floatingButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  refreshButton: {
    // 個別の配置指定を削除
  },
  myLocationButton: {
    // 個別の配置指定を削除
  },
  myLocationButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  // カスタムマーカー
  customMarker: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.medium,
  },
  selectedMarker: {
    borderColor: Colors.secondary,
    borderWidth: 4,
    // transform を削除してスケール変更による位置ずれを防ぐ
    ...Shadows.large,
  },
  markerAvatar: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.round,
  },

  // 投稿パネル
  postsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.large,
    // タブバーより前面に表示
    zIndex: 100,
  },
  
  // パネルハンドル
  panelHandle: {
    height: HANDLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  swipeHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  
  // 投稿ヘッダー
  postsHeader: {
    height: POSTS_HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  postsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  postsBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    minWidth: 24,
    alignItems: 'center',
  },
  postsBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeight.semiBold,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  clearFilterText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 投稿リスト
  postsList: {
    flex: 1,
  },
  postsListContent: {
    padding: Spacing.sm,
    paddingBottom: TAB_BAR_HEIGHT + Spacing.xl, // タブバーの高さ + 余白を追加
  },

  // 投稿カード
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadows.small,
  },
  
  // 投稿ヘッダー
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.round,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  postInfo: {
    flex: 1,
  },
  username: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  moreButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  
  // 投稿コンテンツ
  postContent: {
    fontSize: Typography.fontSize.md,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  
  // 投稿アクション
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
});