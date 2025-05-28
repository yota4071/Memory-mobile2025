// src/screens/HomeScreen.tsx - EAS対応版
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
  Platform
} from 'react-native';

// 🗺️ Expo用のマップコンポーネント
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

// 🔧 環境変数から設定を取得
const getConfigValue = (key: string, defaultValue: string = ''): string => {
  // EAS Build時はConstants.expoConfig.extraから取得
  const expoConfigValue = Constants.expoConfig?.extra?.[key];
  if (expoConfigValue) {
    return expoConfigValue;
  }
  
  // 開発時はprocess.envから取得
  if (typeof process !== 'undefined' && process.env) {
    const envValue = process.env[`EXPO_PUBLIC_${key.toUpperCase()}`];
    if (envValue) {
      return envValue;
    }
  }
  
  return defaultValue;
};

// 🌍 アプリ設定
const AppConfig = {
  googleMapsApiKey: getConfigValue('googleMapsApiKey'),
  apiBaseUrl: getConfigValue('apiBaseUrl', 'http://localhost:3000'),
  environment: getConfigValue('environment', 'development'),
  debugMode: getConfigValue('debugMode', 'false') === 'true',
};

// 🚨 開発時のAPIキー確認
if (__DEV__ && !AppConfig.googleMapsApiKey) {
  console.warn(
    '⚠️ Google Maps APIキーが設定されていません。\n' +
    '.envファイルでEXPO_PUBLIC_GOOGLE_MAPS_API_KEYを設定してください。'
  );
}

// デバッグログ出力
if (AppConfig.debugMode) {
  console.log('🔧 App Config:', {
    hasApiKey: !!AppConfig.googleMapsApiKey,
    apiBaseUrl: AppConfig.apiBaseUrl,
    environment: AppConfig.environment,
    platform: Platform.OS,
  });
}

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

// サンプルデータ（東京周辺）
const samplePosts: Post[] = [
  {
    id: '1',
    username: 'Yuki_Tokyo',
    content: '渋谷のカフェで素敵なラテアートを発見！☕️',
    timestamp: '2分前',
    latitude: 35.6598,
    longitude: 139.7006,
    likes: 12,
    distance: 50,
    avatar: 'https://i.pravatar.cc/50?img=1'
  },
  {
    id: '2', 
    username: 'TechLover',
    content: '新宿のプログラミングイベントに参加中！みんなも来て〜',
    timestamp: '5分前',
    latitude: 35.6938,
    longitude: 139.7036,
    likes: 8,
    distance: 120,
    avatar: 'https://i.pravatar.cc/50?img=2'
  },
  {
    id: '3',
    username: 'FoodieTokyo',
    content: '原宿で見つけた絶品たい焼き🐟 行列ができる理由がわかった！',
    timestamp: '10分前',
    latitude: 35.6702,
    longitude: 139.7016,
    likes: 25,
    distance: 200,
    avatar: 'https://i.pravatar.cc/50?img=3'
  },
  {
    id: '4',
    username: 'NatureWalker',
    content: '代々木公園でお花見🌸 桜が満開で美しい！',
    timestamp: '15分前',
    latitude: 35.6732,
    longitude: 139.6958,
    likes: 18,
    distance: 350,
    avatar: 'https://i.pravatar.cc/50?img=4'
  }
];

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  // 🚀 アプリ初期化
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

  // 🔐 位置情報の権限を要求
  const requestLocationPermission = async () => {
    try {
      if (AppConfig.debugMode) {
        console.log('🔐 位置情報の権限を要求中...');
      }
      
      // Expo Location を使用して権限を要求
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('❌ 位置情報の権限が拒否されました');
        Alert.alert(
          '位置情報の権限が必要です',
          'このアプリでは周辺の投稿を表示するために位置情報が必要です。設定から位置情報を許可してください。',
          [
            { 
              text: 'デフォルト位置を使用', 
              onPress: () => {
                setUserLocation({
                  latitude: 35.6812,
                  longitude: 139.7671
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

      if (AppConfig.debugMode) {
        console.log('✅ 位置情報の権限が許可されました');
      }
      
      setHasLocationPermission(true);
      await getCurrentLocation();
      
    } catch (error) {
      console.error('❌ 権限要求エラー:', error);
      Alert.alert('エラー', '位置情報の権限取得に失敗しました。デフォルト位置を使用します。');
      setUserLocation({
        latitude: 35.6812,
        longitude: 139.7671
      });
      setIsLoading(false);
    }
  };

  // 📍 現在位置を取得
  const getCurrentLocation = async () => {
    try {
      if (AppConfig.debugMode) {
        console.log('📍 現在位置を取得中...');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });
      
      if (AppConfig.debugMode) {
        console.log('✅ 位置情報取得成功:', location.coords);
      }
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ 現在位置取得エラー:', error);
      Alert.alert(
        '位置情報取得エラー',
        'デフォルト位置（東京駅）を使用します。GPS設定を確認してください。',
        [{ text: 'OK' }]
      );
      
      // デフォルト位置（東京駅）
      setUserLocation({
        latitude: 35.6812,
        longitude: 139.7671
      });
      setIsLoading(false);
    }
  };

  // 🔄 位置情報を再取得
  const refreshLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    if (hasLocationPermission) {
      await getCurrentLocation();
    } else {
      await requestLocationPermission();
    }
  };

  // 🗺 地図上の位置に移動
  const moveToLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  // 📲 投稿を取得（将来的にAPIから取得）
  const fetchPosts = async () => {
    try {
      if (AppConfig.debugMode) {
        console.log('📲 投稿を取得中...', AppConfig.apiBaseUrl);
      }
      
      // 将来的にはAPIから取得
      // const response = await fetch(`${AppConfig.apiBaseUrl}/api/posts/nearby`);
      // const data = await response.json();
      // setPosts(data);
      
      // 現在はサンプルデータを使用
      setPosts(samplePosts);
      
    } catch (error) {
      console.error('投稿取得エラー:', error);
      if (AppConfig.debugMode) {
        Alert.alert('デバッグ', `投稿取得エラー: ${error}`);
      }
    }
  };

  // 📝 投稿アイテムレンダリング
  const renderPost = ({ item }: { item: Post }) => (
    <View style={[GlobalStyles.card, styles.postContainer]}>
      <View style={[GlobalStyles.listItem, styles.postHeader]}>
        <Image 
          source={{ uri: item.avatar || 'https://i.pravatar.cc/50?img=5' }}
          style={GlobalStyles.avatar}
        />
        <View style={styles.postInfo}>
          <Text style={[GlobalStyles.textBody, StyleUtils.textColor('textPrimary')]}>
            {item.username}
          </Text>
          <Text style={[GlobalStyles.textCaption, StyleUtils.textColor('textSecondary')]}>
            {item.timestamp} • {item.distance}m
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Text style={[GlobalStyles.textBody, StyleUtils.marginVertical('sm')]}>
        {item.content}
      </Text>
      
      <View style={[styles.postActions, StyleUtils.paddingVertical('sm')]}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={Colors.textSecondary} />
          <Text style={[GlobalStyles.textCaption, StyleUtils.marginHorizontal('xs')]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={[GlobalStyles.textCaption, StyleUtils.marginHorizontal('xs')]}>
            返信
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => moveToLocation(item.latitude, item.longitude)}
        >
          <Ionicons name="location-outline" size={20} color={Colors.primary} />
          <Text style={[GlobalStyles.textCaption, StyleUtils.marginHorizontal('xs'), { color: Colors.primary }]}>
            位置
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 🔄 ローディング画面
  if (isLoading) {
    return (
      <View style={GlobalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={GlobalStyles.loadingText}>
          {hasLocationPermission ? '位置情報を取得中...' : '権限を確認中...'}
        </Text>
        {AppConfig.debugMode && (
          <Text style={[GlobalStyles.textCaption, StyleUtils.marginVertical('sm')]}>
            環境: {AppConfig.environment}
          </Text>
        )}
      </View>
    );
  }

  // ❌ エラー画面
  if (error) {
    return (
      <View style={GlobalStyles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={[GlobalStyles.textHeading, StyleUtils.textColor('error')]}>
          エラーが発生しました
        </Text>
        <Text style={[GlobalStyles.textBody, StyleUtils.marginVertical('sm')]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[GlobalStyles.buttonPrimary, StyleUtils.marginVertical('md')]}
          onPress={initializeApp}
        >
          <Text style={GlobalStyles.buttonTextPrimary}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      {/* 📱 ヘッダー */}
      <View style={GlobalStyles.header}>
        <Text style={GlobalStyles.headerTitle}>
          Balloon
          {AppConfig.debugMode && (
            <Text style={[GlobalStyles.textCaption, { color: Colors.warning }]}>
              {' '}({AppConfig.environment})
            </Text>
          )}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 🗺 マップ部分 */}
      <View style={styles.mapContainer}>
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
            showsScale={true}
            onMapReady={() => {
              if (AppConfig.debugMode) {
                console.log('🗺️ マップの準備が完了しました');
              }
            }}
          >
            {/* 📍 ユーザーの現在位置マーカー（権限がない場合のみ表示） */}
            {!hasLocationPermission && (
              <Marker
                coordinate={userLocation}
                title="デフォルト位置"
                description="東京駅周辺"
                pinColor={Colors.primary}
              />
            )}
            
            {/* 📝 投稿のマーカー */}
            {posts.map((post) => (
              <Marker
                key={post.id}
                coordinate={{
                  latitude: post.latitude,
                  longitude: post.longitude,
                }}
                title={post.username}
                description={post.content.substring(0, 50) + '...'}
                onPress={() => {
                  if (AppConfig.debugMode) {
                    console.log(`📍 投稿 ${post.id} がタップされました`);
                  }
                }}
              >
                <View style={styles.customMarker}>
                  <Image 
                    source={{ uri: post.avatar || 'https://i.pravatar.cc/30?img=5' }}
                    style={styles.markerAvatar}
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={[GlobalStyles.centerContainer, { backgroundColor: Colors.surface }]}>
            <Ionicons name="location-outline" size={48} color={Colors.textTertiary} />
            <Text style={[GlobalStyles.textBody, StyleUtils.textColor('textSecondary')]}>
              位置情報を取得できませんでした
            </Text>
            <TouchableOpacity 
              style={[GlobalStyles.buttonPrimary, StyleUtils.marginVertical('md')]}
              onPress={refreshLocation}
            >
              <Text style={GlobalStyles.buttonTextPrimary}>再試行</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* 🔄 更新ボタン */}
        <TouchableOpacity 
          style={[GlobalStyles.buttonPrimary, styles.refreshButton]} 
          onPress={refreshLocation}
        >
          <Ionicons name="refresh" size={20} color={Colors.textWhite} />
        </TouchableOpacity>
        
        {/* 📍 現在位置ボタン */}
        {userLocation && (
          <TouchableOpacity 
            style={[GlobalStyles.buttonSecondary, styles.myLocationButton]} 
            onPress={() => moveToLocation(userLocation.latitude, userLocation.longitude)}
          >
            <Ionicons name="navigate" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 📝 投稿リスト部分 */}
      <View style={[StyleUtils.backgroundColor('surface'), styles.postsContainer]}>
        <View style={[GlobalStyles.listItem, styles.postsHeader]}>
          <Text style={GlobalStyles.textHeading}>周辺の投稿</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="filter" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={fetchPosts}
            >
              <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          style={styles.postsList}
          contentContainerStyle={{ paddingBottom: Spacing.md }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: Spacing.xs,
  },
  
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  
  map: {
    flex: 1,
  },
  
  refreshButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    ...Shadows.medium,
  },
  
  myLocationButton: {
    position: 'absolute',
    top: Spacing.sm + 54, // refreshButtonの下に配置
    right: Spacing.sm,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    ...Shadows.medium,
  },
  
  // 📍 カスタムマーカー
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.medium,
  },
  
  markerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  
  postsContainer: {
    flex: 1,
  },
  
  postsHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  
  headerActions: {
    flexDirection: 'row',
  },
  
  headerActionButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  
  postsList: {
    flex: 1,
  },
  
  postContainer: {
    // GlobalStyles.cardを使用
  },
  
  postHeader: {
    borderBottomWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  
  postInfo: {
    flex: 1,
  },
  
  moreButton: {
    padding: Spacing.xs,
  },
  
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
  },
});