// src/screens/post/CameraScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Map } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../../styles/GlobalStyles';
import { CapturedImage, LocationData } from '../PostScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// HomeScreenと同じタブバー高さ定数
const TAB_BAR_HEIGHT = 60;

interface CameraScreenProps {
  onPhotoTaken: (imageData: CapturedImage, location?: LocationData) => void;
  onGallerySelect: (imageData: CapturedImage, location?: LocationData) => void;
  onPostWithoutImage: (location?: LocationData) => void;
}

export default function CameraScreen({
  onPhotoTaken,
  onGallerySelect,
  onPostWithoutImage,
}: CameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    getCurrentLocation();
  }, [permission, requestPermission]);

  // 現在位置を取得
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const defaultLocation = {
          latitude: 34.7024,
          longitude: 135.4959,
          address: '大阪市, 日本'
        };
        setCurrentLocation(defaultLocation);
        setSelectedLocation(defaultLocation);
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

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address,
      };

      setCurrentLocation(locationData);
      setSelectedLocation(locationData);
    } catch (error) {
      console.error('位置情報取得エラー:', error);
      const defaultLocation = {
        latitude: 34.7024,
        longitude: 135.4959,
        address: '大阪市, 日本'
      };
      setCurrentLocation(defaultLocation);
      setSelectedLocation(defaultLocation);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // フラッシュモード切り替え
  const toggleFlashMode = () => {
    setFlashMode(current => {
      switch (current) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  };

  // フラッシュアイコンを取得
  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on': return 'flash';
      case 'auto': return 'flash-auto';
      case 'off': 
      default: return 'flash-off';
    }
  };

  // 写真撮影
  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || !permission?.granted) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        onPhotoTaken({
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
        }, selectedLocation || undefined);
      }
    } catch (error) {
      console.error('撮影エラー:', error);
      Alert.alert('エラー', '写真の撮影に失敗しました');
    } finally {
      setIsCapturing(false);
    }
  };

  // ギャラリーから画像選択
  const selectFromGallery = async () => {
    try {
      // メディアライブラリの権限を確認
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('権限が必要です', 'ギャラリーにアクセスするには権限が必要です');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onGallerySelect({
          uri: asset.uri,
          width: asset.width || 1000,
          height: asset.height || 1000,
        }, selectedLocation || undefined);
      }
    } catch (error) {
      console.error('ギャラリー選択エラー:', error);
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  // 位置選択マップでの位置変更
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // 非同期処理を分離
    updateLocationFromCoordinates(latitude, longitude);
  };

  // 座標から住所を取得して位置を更新
  const updateLocationFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      // 逆ジオコーディングで住所を取得
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = '選択した場所';
      if (reverseGeocode.length > 0) {
        const locationInfo = reverseGeocode[0];
        address = `${locationInfo.city || locationInfo.district || locationInfo.subregion || '不明な場所'}, ${locationInfo.country || ''}`;
      }

      setSelectedLocation({
        latitude,
        longitude,
        address,
      });
    } catch (error) {
      console.error('逆ジオコーディングエラー:', error);
      setSelectedLocation({
        latitude,
        longitude,
        address: '選択した場所',
      });
    }
  };

  // 位置選択の確定
  const confirmLocationSelection = () => {
    setShowLocationModal(false);
  };

  // 位置選択のキャンセル
  const cancelLocationSelection = () => {
    setSelectedLocation(currentLocation);
    setShowLocationModal(false);
  };

  // カメラタイプ切り替え
  const toggleCameraType = () => {
    setCameraType(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  // 画像なしで投稿（修正版）
  const handlePostWithoutImage = () => {
    onPostWithoutImage(selectedLocation || undefined);
  };

  // 権限が未取得の場合
  if (!permission) {
    return (
      <View style={[styles.centerContainer, { paddingBottom: TAB_BAR_HEIGHT + Spacing.xl }]}>
        <Text style={styles.permissionText}>カメラの権限を確認中...</Text>
      </View>
    );
  }

  // 権限が拒否された場合
  if (!permission.granted) {
    return (
      <View style={[styles.centerContainer, { paddingBottom: TAB_BAR_HEIGHT + Spacing.xl }]}>
        <Ionicons name="camera-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.permissionText}>カメラの権限が必要です</Text>
        <Text style={styles.permissionSubtext}>
          投稿用の写真を撮影するために、カメラへのアクセスを許可してください
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>権限を許可</Text>
        </TouchableOpacity>
        
        {/* 権限なしでもギャラリーと画像なし投稿は可能 */}
        <View style={styles.alternativeOptions}>
          <TouchableOpacity style={styles.alternativeButton} onPress={selectFromGallery}>
            <Ionicons name="images-outline" size={24} color={Colors.primary} />
            <Text style={styles.alternativeButtonText}>ギャラリーから選択</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.alternativeButton} onPress={handlePostWithoutImage}>
            <Ionicons name="text-outline" size={24} color={Colors.primary} />
            <Text style={styles.alternativeButtonText}>テキストのみ投稿</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* カメラビュー */}
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          onCameraReady={() => setIsReady(true)}
        >
          {/* 上部コントロール */}
          <View style={[styles.topControls, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlashMode}>
              <Ionicons name={getFlashIcon() as any} size={24} color={Colors.textWhite} />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>新しい投稿</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={24} color={Colors.textWhite} />
            </TouchableOpacity>
          </View>

          {/* グリッドライン（オプション） */}
          <View style={styles.gridContainer}>
            <View style={styles.gridLineHorizontal} />
            <View style={styles.gridLineVertical} />
          </View>

          {/* 位置選択ボタン - タブバーの高さを考慮して配置 */}
          <TouchableOpacity 
            style={[
              styles.locationButton,
              { bottom: TAB_BAR_HEIGHT + 160 } // カメラボタンより上に配置
            ]}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.locationButtonInner}>
              <Map size={20} color={Colors.textWhite} />
              <Text style={styles.locationButtonText} numberOfLines={1}>
                {isLoadingLocation ? '取得中...' : (selectedLocation?.address || '場所を設定')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 下部コントロール - タブバーの高さを考慮 */}
          <View style={[styles.bottomControls, { bottom: TAB_BAR_HEIGHT + Spacing.md }]}>
            {/* ギャラリーボタン */}
            <TouchableOpacity 
              style={styles.sideButton}
              onPress={selectFromGallery}
            >
              <View style={styles.sideButtonInner}>
                <Ionicons name="images" size={24} color={Colors.textWhite} />
              </View>
              <Text style={styles.buttonText}>ギャラリー</Text>
            </TouchableOpacity>

            {/* 撮影ボタン */}
            <TouchableOpacity
              style={[
                styles.captureButton,
                isCapturing && styles.captureButtonPressed
              ]}
              onPress={takePicture}
              disabled={!isReady || isCapturing}
            >
              <View style={styles.captureButtonInner}>
                {isCapturing ? (
                  <View style={styles.capturingIndicator} />
                ) : (
                  <Ionicons name="camera" size={32} color={Colors.textWhite} />
                )}
              </View>
            </TouchableOpacity>

            {/* 画像なしで投稿ボタン */}
            <TouchableOpacity 
              style={styles.sideButton}
              onPress={handlePostWithoutImage}
            >
              <View style={styles.sideButtonInner}>
                <Ionicons name="text" size={24} color={Colors.textWhite} />
              </View>
              <Text style={styles.buttonText}>画像なし</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

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
              latitude: selectedLocation?.latitude || 34.7024,
              longitude: selectedLocation?.longitude || 135.4959,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                pinColor={Colors.error}
                title="投稿場所"
                description={selectedLocation.address}
              />
            )}
          </MapView>

          {/* 現在の選択位置情報 */}
          <View style={styles.selectedLocationInfo}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.selectedLocationText}>
              {selectedLocation?.address || '場所を選択してください'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },

  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },

  camera: {
    flex: 1,
  },

  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },

  controlButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textWhite,
  },

  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },

  gridLineHorizontal: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    height: 1,
  },

  gridLineVertical: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 1,
    height: '100%',
  },

  // 位置選択ボタン
  locationButton: {
    position: 'absolute',
    right: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.lg,
    maxWidth: 200,
    zIndex: 15,
  },

  locationButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  locationButtonText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.xs,
    marginLeft: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },

  bottomControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    zIndex: 20,
  },

  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  sideButtonInner: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },

  buttonText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textWhite,
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },

  captureButtonPressed: {
    backgroundColor: Colors.primary,
    transform: [{ scale: 0.95 }],
  },

  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  capturingIndicator: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.error,
  },

  permissionText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  permissionSubtext: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },

  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },

  retryButtonText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },

  alternativeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.md,
  },

  alternativeButton: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 120,
    ...Shadows.small,
  },

  alternativeButtonText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
});