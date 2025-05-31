// ==========================================
// 📁 app.config.js（動的設定）
// ==========================================
// app.config.js
export default {
  expo: {
    name: "LocalSNS",
    slug: "localsns",
    version: "1.0.0",
    orientation: "portrait",
    // 🔥 Linkingの警告対策：スキーム追加
    scheme: "localsns",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "このアプリは周辺の投稿を表示するために位置情報を使用します。",
        NSLocationAlwaysAndWhenInUseUsageDescription: "このアプリは周辺の投稿を表示するために位置情報を使用します。",
        // 🔥 カメラ権限追加
        NSCameraUsageDescription: "このアプリでは投稿用の写真撮影にカメラを使用します。",
        NSMicrophoneUsageDescription: "動画撮影時に音声を録音するためマイクへのアクセスが必要です。",
        // 🔥 フォトライブラリ権限追加
        NSPhotoLibraryUsageDescription: "このアプリでは投稿用の画像選択にフォトライブラリへのアクセスが必要です。"
      },
      config: {
        // 🔒 環境変数から取得（本番では空文字でOK）
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        // 🔥 カメラ・ストレージ権限追加
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES"
      ],
      config: {
        // 🔒 環境変数から取得
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      // 🔥 カメラプラグイン追加
      [
        "expo-camera",
        {
          cameraPermission: "このアプリでは投稿用の写真撮影にカメラを使用します。",
          microphonePermission: "動画撮影時に音声を録音するためマイクへのアクセスが必要です。"
        }
      ],
      // 🔥 画像選択プラグイン追加
      [
        "expo-image-picker",
        {
          photosPermission: "このアプリでは投稿用の画像選択にフォトライブラリへのアクセスが必要です。"
        }
      ]
    ],
    extra: {
      // 🔒 アプリ内で使用する環境変数
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      // 🔥 デバッグモード追加
      debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE || "false",
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || "development"
    }
  }
};