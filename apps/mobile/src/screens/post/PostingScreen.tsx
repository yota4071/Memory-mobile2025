// src/screens/post/PostingScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import {
  GlobalStyles,
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../../styles/GlobalStyles';
import { CapturedImage, LocationData } from '../PostScreen';

interface PostingScreenProps {
  capturedImage: CapturedImage | null;
  initialLocation?: LocationData | null;
  onPostComplete: () => void;
  onCancel: () => void;
}

export default function PostingScreen({
  capturedImage,
  initialLocation,
  onPostComplete,
  onCancel,
}: PostingScreenProps) {
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // 初期位置が渡された場合はそれを使用、そうでなければ現在位置を取得
    if (initialLocation) {
      setLocation(initialLocation);
      setIsLoadingLocation(false);
    } else {
      getCurrentLocation();
    }
  }, [initialLocation]);

  // 現在位置を取得
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocation({
          latitude: 34.7024,
          longitude: 135.4959,
          address: '大阪市, 日本'
        });
        setIsLoadingLocation(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 逆ジオコーディングで住所を取得
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      let address = '場所不明';
      if (reverseGeocode.length > 0) {
        const locationInfo = reverseGeocode[0];
        address = `${locationInfo.city || locationInfo.district || locationInfo.subregion}, ${locationInfo.country}`;
      }

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address,
      });
    } catch (error) {
      console.error('位置情報取得エラー:', error);
      setLocation({
        latitude: 34.7024,
        longitude: 135.4959,
        address: '大阪市, 日本'
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // 位置選択マップでの位置変更
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    updateLocationFromCoordinates(latitude, longitude);
  };

  // 座標から住所を取得して位置を更新
  const updateLocationFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = '選択した場所';
      if (reverseGeocode.length > 0) {
        const locationInfo = reverseGeocode[0];
        address = `${locationInfo.city || locationInfo.district || locationInfo.subregion || '不明な場所'}, ${locationInfo.country || ''}`;
      }

      setLocation({
        latitude,
        longitude,
        address: '選択した場所',
      });
    } catch (error) {
      console.error("逆ジオコーディングエラー:", error);
    }
  };

  // 位置選択の確定
  const confirmLocationSelection = () => {
    setShowLocationModal(false);
  };

  // 位置選択のキャンセル
  const cancelLocationSelection = () => {
    setShowLocationModal(false);
  };

  // 投稿実行
  const handlePost = async () => {
    if (!postText.trim() && !capturedImage) {
      Alert.alert('エラー', '投稿内容または画像が必要です');
      return;
    }

    if (!location) {
      Alert.alert('エラー', '位置情報の取得に失敗しました');
      return;
    }

    try {
      setIsPosting(true);

      // 実際のAPIコール（例）
      const postData = {
        content: postText.trim(),
        image: capturedImage?.uri,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
        timestamp: new Date().toISOString(),
      };

      // TODO: 実際のAPI呼び出し
      console.log('投稿データ:', postData);
      
      // 模擬的な投稿処理
      await new Promise(resolve => setTimeout(resolve, 2000));

      onPostComplete();
    } catch (error) {
      console.error('投稿エラー:', error);
      Alert.alert('エラー', '投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsPosting(false);
    }
  };

  // 文字数の色を動的に変更
  const getCharacterCountColor = () => {
    const length = postText.length;
    if (length > 250) return Colors.error;
    if (length > 200) return Colors.warning;
    return Colors.textSecondary;
  };

  return (
    <View style={GlobalStyles.container}>
      <StatusBar style="dark" />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onCancel}
          disabled={isPosting}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>新しい投稿</Text>
        
        <TouchableOpacity 
          style={[
            styles.postButton,
            (!postText.trim() && !capturedImage) && styles.postButtonDisabled
          ]}
          onPress={handlePost}
          disabled={isPosting || (!postText.trim() && !capturedImage)}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color={Colors.textWhite} />
          ) : (
            <Text style={styles.postButtonText}>投稿</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 画像プレビュー */}
        {capturedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          </View>
        )}

        {/* テキスト入力 */}
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={capturedImage ? "写真について説明を追加..." : "今何をしていますか？"}
            placeholderTextColor={Colors.textSecondary}
            value={postText}
            onChangeText={setPostText}
            multiline
            maxLength={280}
            editable={!isPosting}
          />
          
          <View style={styles.inputFooter}>
            <Text style={[styles.characterCount, { color: getCharacterCountColor() }]}>
              {postText.length}/280
            </Text>
          </View>
        </View>

        {/* 位置情報カード */}
        <View style={styles.locationContainer}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.locationTitle}>位置情報</Text>
          </View>
          
          {isLoadingLocation ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.locationLoadingText}>位置情報を取得中...</Text>
            </View>
          ) : (
            <View>
              {/* 位置情報表示とマップ */}
              <View style={styles.locationDisplayContainer}>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>{location?.address}</Text>
                  <TouchableOpacity 
                    style={styles.locationChangeButton}
                    onPress={() => setShowLocationModal(true)}
                  >
                    <Ionicons name="create-outline" size={16} color={Colors.primary} />
                    <Text style={styles.locationChangeText}>変更</Text>
                  </TouchableOpacity>
                </View>
                
                {/* ミニマップ */}
                {location && (
                  <TouchableOpacity 
                    style={styles.miniMapContainer}
                    onPress={() => setShowLocationModal(true)}
                    activeOpacity={0.8}
                  >
                    <MapView
                      style={styles.miniMap}
                      region={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                      pointerEvents="none"
                    >
                      <Marker
                        coordinate={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                        pinColor={Colors.primary}
                      />
                    </MapView>
                    <View style={styles.miniMapOverlay}>
                      <Ionicons name="expand-outline" size={16} color={Colors.textWhite} />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* 投稿オプション */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>投稿オプション</Text>
          
          <TouchableOpacity style={styles.optionItem} disabled={isPosting}>
            <Ionicons name="people-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.optionText}>フォロワーのみに表示</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem} disabled={isPosting}>
            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.optionText}>24時間後に自動削除</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* 投稿についての説明 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            投稿は周辺のユーザーに表示されます。位置情報は正確な住所ではなく、おおよその地域として表示されます。
          </Text>
        </View>
      </ScrollView>

      {/* 位置選択モーダル */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={cancelLocationSelection}
            >
              <Text style={styles.modalButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>投稿場所を選択</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={confirmLocationSelection}
            >
              <Text style={[styles.modalButtonText, { color: Colors.primary }]}>完了</Text>
            </TouchableOpacity>
          </View>

          <MapView
            ref={mapRef}
            style={styles.fullMap}
            initialRegion={{
              latitude: location?.latitude || 34.7024,
              longitude: location?.longitude || 135.4959,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            onPress={handleMapPress}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                pinColor={Colors.primary}
                title="投稿場所"
                description={location.address}
              />
            )}
          </MapView>

          {/* 現在の選択位置情報 */}
          <View style={styles.selectedLocationInfo}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.selectedLocationText}>
              {location?.address || '場所を選択してください'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* 投稿中のオーバーレイ */}
      {isPosting && (
        <View style={styles.postingOverlay}>
          <View style={styles.postingModal}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.postingText}>投稿中...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },

  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 60,
    alignItems: 'center',
    ...Shadows.small,
  },

  postButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },

  postButtonText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },

  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingBottom: 60 + 32, // タブバーの高さ + 余白
  },

  imageContainer: {
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },

  previewImage: {
    width: '100%',
    aspectRatio: 4/3,
    resizeMode: 'cover',
  },

  textInputContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },

  textInput: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
  },

  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  characterCount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  locationContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  locationTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },

  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationLoadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },

  locationDisplayContainer: {
    gap: Spacing.sm,
  },

  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },

  locationChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
  },

  locationChangeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },

  // ミニマップ
  miniMapContainer: {
    height: 120,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.small,
  },

  miniMap: {
    flex: 1,
  },

  miniMapOverlay: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },

  optionsContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },

  optionsTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  optionText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },

  infoContainer: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.info + '10',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },

  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },

  // モーダルのスタイル
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.statusBarHeight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },

  modalButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 60,
    alignItems: 'center',
  },

  modalButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },

  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },

  fullMap: {
    flex: 1,
  },

  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  selectedLocationText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },

  postingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  postingModal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.large,
  },

  postingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
});
        