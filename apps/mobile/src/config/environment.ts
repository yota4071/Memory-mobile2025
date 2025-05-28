// ==========================================
// 📁 src/config/environment.ts（設定管理）
// ==========================================
// src/config/environment.ts
import Constants from 'expo-constants';

interface EnvironmentConfig {
  googleMapsApiKey: string;
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// 🔒 環境変数を安全に取得する関数
const getEnvironmentVar = (key: string, defaultValue: string = ''): string => {
  // Expo Constantsから取得を試行
  const value = Constants.expoConfig?.extra?.[key] || 
                Constants.manifest?.extra?.[key] || 
                Constants.manifest2?.extra?.[key];
  
  if (value) {
    return value;
  }
  
  // フォールバック：process.envから取得
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`EXPO_PUBLIC_${key.toUpperCase()}`] || defaultValue;
  }
  
  return defaultValue;
};

// 🌍 環境設定オブジェクト
export const Environment: EnvironmentConfig = {
  googleMapsApiKey: getEnvironmentVar('googleMapsApiKey'),
  apiBaseUrl: getEnvironmentVar('apiBaseUrl', 'https://localhost:3000'),
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

// 🚨 開発時のAPIキー確認
if (__DEV__ && !Environment.googleMapsApiKey) {
  console.warn(
    '⚠️ Google Maps APIキーが設定されていません。\n' +
    '.envファイルでEXPO_PUBLIC_GOOGLE_MAPS_API_KEYを設定してください。'
  );
}

// 🔒 APIキーの妥当性チェック
export const validateApiKey = (apiKey: string): boolean => {
  return apiKey && apiKey.length > 20 && apiKey.startsWith('AIza');
};