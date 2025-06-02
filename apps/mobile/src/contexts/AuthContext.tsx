import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 環境変数の取得（簡易版）
const getApiBaseUrl = () => {
  // 開発環境では自分のPCのIPアドレスに変更してください
  return 'http://192.168.0.9:3001/dev'; // ← ここを自分のIPアドレスに変更
};

interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string, bio?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時にストレージからデータを読み込み
  useEffect(() => {
    loadStoredAuthData();
  }, []);

  // ストレージからトークンとユーザー情報を読み込み
  const loadStoredAuthData = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY)
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // トークンが有効かどうか確認
        await verifyToken(storedToken);
      }
    } catch (error) {
      console.error('認証データ読み込みエラー:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // // トークンの有効性を確認
  // const verifyToken = async (authToken: string) => {
  //   try {
  //     const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
  //       headers: {
  //         'Authorization': `Bearer ${authToken}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Token verification failed');
  //     }

  //     const data = await response.json();
  //     if (data.success) {
  //       setUser(data.user);
  //       await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  //     }
  //   } catch (error) {
  //     console.error('トークン確認エラー:', error);
  //     await clearAuthData();
  //   }
  // };
  // これが、フロントの認証をスキップするダミー認証です
const verifyToken = async (authToken: string) => {
  // 検証をスキップして成功扱いにする
  const dummyUser = {
    id: 1,
    username: 'GuestUser',
    email: 'guest@example.com',
    bio: 'Guest',
    createdAt: new Date().toISOString()
  };
  setUser(dummyUser);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(dummyUser));
};
// ログイン（フロントだけで成功させるモック版）
const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  const dummyUser = {
    id: 1,
    username: 'GuestUser',
    email,
    bio: 'ゲストユーザー',
    createdAt: new Date().toISOString(),
  };
  const dummyToken = 'dummy-token';

  await setAuthData(dummyToken, dummyUser);

  return { success: true, message: 'ログイン成功（モック）' };
};

  // // ログイン
  // const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  //   try {
  //     const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await response.json();

  //     if (response.ok && data.success) {
  //       await setAuthData(data.token, data.user);
  //       return { success: true, message: data.message };
  //     } else {
  //       return { success: false, message: data.message || 'ログインに失敗しました' };
  //     }
  //   } catch (error) {
  //     console.error('ログインエラー:', error);
  //     return { success: false, message: 'ネットワークエラーが発生しました' };
  //   }
  // };

  // 新規登録
  const register = async (username: string, email: string, password: string, bio?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, bio }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await setAuthData(data.token, data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || '登録に失敗しました' };
      }
    } catch (error) {
      console.error('登録エラー:', error);
      return { success: false, message: 'ネットワークエラーが発生しました' };
    }
  };

  // ログアウト
  const logout = async () => {
    await clearAuthData();
  };

  // ユーザー情報の更新
  const refreshUser = async () => {
    if (token) {
      await verifyToken(token);
    }
  };

  // 認証データの保存
  const setAuthData = async (authToken: string, userData: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
      ]);
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('認証データ保存エラー:', error);
    }
  };

  // 認証データのクリア
  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('認証データクリアエラー:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}