// src/screens/PostScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Alert,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CameraScreen from './post/CameraScreen';
import PostingScreen from './post/PostingScreen';
import {
  GlobalStyles,
} from '../styles/GlobalStyles';

// 投稿の状態を管理する型
export type PostState = 'camera' | 'posting';

// 撮影した画像の情報
export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
}

// 位置情報の型定義
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function PostScreen() {
  const [currentState, setCurrentState] = useState<PostState>('camera');
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [postLocation, setPostLocation] = useState<LocationData | null>(null);
  
  // 初回フォーカス時のリセットを防ぐためのref
  const hasInitialized = useRef(false);

  // 画面がフォーカスされた時の処理
  useFocusEffect(
    React.useCallback(() => {
      console.log('🎯 PostScreen: useFocusEffect実行', { hasInitialized: hasInitialized.current });
      
      // 初回のみリセット処理をスキップ
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        console.log('🚀 PostScreen: 初回フォーカス - リセットスキップ');
      } else {
        // 2回目以降のフォーカス時のみリセット（他のタブから戻ってきた時など）
        console.log('🔄 PostScreen: 2回目以降のフォーカス - 状態リセット');
        setCurrentState('camera');
        setCapturedImage(null);
        setPostLocation(null);
      }
      
      // Androidの戻るボタンの処理
      const onBackPress = () => {
        console.log('⬅️ PostScreen: 戻るボタン押下', { currentState });
        
        // currentStateを直接参照せず、setStateのコールバックで現在の状態を取得
        setCurrentState(prevState => {
          if (prevState === 'posting') {
            console.log('⬅️ PostScreen: posting -> camera に戻る');
            setCapturedImage(null);
            setPostLocation(null);
            return 'camera';
          }
          return prevState;
        });
        
        return true; // デフォルトの戻る動作を防ぐ
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        console.log('🧹 PostScreen: useFocusEffect cleanup');
        subscription.remove();
      };
    }, []) // 依存配列を空にして、currentStateの変更では再実行されないようにする
  );

  // 写真撮影完了時の処理
  const handlePhotoTaken = (imageData: CapturedImage, location?: LocationData) => {
    console.log('📸 PostScreen: 写真撮影完了', {
      imageUri: imageData.uri,
      size: `${imageData.width}x${imageData.height}`,
      location: location?.address
    });
    
    setCapturedImage(imageData);
    setPostLocation(location || null);
    
    console.log('🔄 PostScreen: posting状態に遷移開始');
    setCurrentState('posting');
  };

  // ギャラリーから選択時の処理
  const handleGallerySelect = (imageData: CapturedImage, location?: LocationData) => {
    console.log('🖼️ PostScreen: ギャラリー選択完了', {
      imageUri: imageData.uri,
      size: `${imageData.width}x${imageData.height}`,
      location: location?.address
    });
    
    setCapturedImage(imageData);
    setPostLocation(location || null);
    
    console.log('🔄 PostScreen: posting状態に遷移開始');
    setCurrentState('posting');
  };

  // 画像なしで投稿する場合
  const handlePostWithoutImage = (location?: LocationData) => {
    console.log('📝 PostScreen: 画像なし投稿', {
      location: location?.address
    });
    
    setCapturedImage(null);
    setPostLocation(location || null);
    
    console.log('🔄 PostScreen: posting状態に遷移開始');
    setCurrentState('posting');
  };

  // 投稿完了時の処理
  const handlePostComplete = () => {
    console.log('✅ PostScreen: 投稿完了');
    
    Alert.alert(
      '投稿完了',
      '投稿が送信されました！',
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('🔄 PostScreen: 投稿完了後カメラ状態に戻る');
            setCurrentState('camera');
            setCapturedImage(null);
            setPostLocation(null);
          }
        }
      ]
    );
  };

  // 投稿キャンセル時の処理
  const handlePostCancel = () => {
    console.log('❌ PostScreen: 投稿キャンセル要求');
    
    Alert.alert(
      '投稿をキャンセル',
      '編集中の内容が失われますが、よろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
          onPress: () => console.log('PostScreen: キャンセルダイアログをキャンセル')
        },
        {
          text: '戻る',
          onPress: () => {
            console.log('🔄 PostScreen: キャンセル後カメラ状態に戻る');
            setCurrentState('camera');
            setCapturedImage(null);
            setPostLocation(null);
          }
        }
      ]
    );
  };

  // 現在の状態をログ出力
  console.log('🎮 PostScreen レンダリング:', {
    currentState,
    hasImage: !!capturedImage,
    hasLocation: !!postLocation,
    imageUri: capturedImage?.uri?.substring(0, 50) + '...'
  });

  return (
    <View style={GlobalStyles.container}>
      {currentState === 'camera' ? (
        <CameraScreen
          onPhotoTaken={handlePhotoTaken}
          onGallerySelect={handleGallerySelect}
          onPostWithoutImage={handlePostWithoutImage}
        />
      ) : (
        <PostingScreen
          capturedImage={capturedImage}
          initialLocation={postLocation}
          onPostComplete={handlePostComplete}
          onCancel={handlePostCancel}
        />
      )}
    </View>
  );
}