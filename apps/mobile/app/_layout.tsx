import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import AuthScreen from '@/src/screens/auth/AuthScreen';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import React from 'react';

// アプリのメインコンテンツコンポーネント
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  // フォント読み込み中またはAuth状態確認中
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors[colorScheme ?? 'light'].background 
      }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  // 認証されていない場合は認証画面を表示
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // 認証済みの場合は通常のアプリ画面を表示
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme} children={''}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// ルートレイアウトコンポーネント
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // フォント読み込み中
  if (!loaded) {
    // フォントの非同期読み込みは開発時のみ発生
    return null;
  }

  return (
    <AuthProvider children={''}>
      <AppContent />
    </AuthProvider>
  );
}