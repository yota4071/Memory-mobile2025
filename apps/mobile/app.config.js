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
        NSLocationAlwaysAndWhenInUseUsageDescription: "このアプリは周辺の投稿を表示するために位置情報を使用します。"
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
        "ACCESS_FINE_LOCATION"
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
      "expo-router"
    ],
    extra: {
      // 🔒 アプリ内で使用する環境変数
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    }
  }
};