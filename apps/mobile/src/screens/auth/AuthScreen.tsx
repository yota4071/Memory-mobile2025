import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register } = useAuth();

  // フォーム入力の更新
  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // フォームリセット
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
    });
  };

  // モード切り替え
  const switchMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    resetForm();
  };

  // バリデーション
  const validateForm = (): { isValid: boolean; message: string } => {
    if (!formData.email.trim()) {
      return { isValid: false, message: 'メールアドレスを入力してください' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { isValid: false, message: '正しいメールアドレスを入力してください' };
    }

    if (!formData.password) {
      return { isValid: false, message: 'パスワードを入力してください' };
    }

    if (formData.password.length < 6) {
      return { isValid: false, message: 'パスワードは6文字以上で入力してください' };
    }

    if (mode === 'register') {
      if (!formData.username.trim()) {
        return { isValid: false, message: 'ユーザー名を入力してください' };
      }

      if (formData.username.length < 3) {
        return { isValid: false, message: 'ユーザー名は3文字以上で入力してください' };
      }

      if (formData.password !== formData.confirmPassword) {
        return { isValid: false, message: 'パスワードが一致しません' };
      }
    }

    return { isValid: true, message: '' };
  };

  // ログイン処理
  const handleLogin = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.message);
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        Alert.alert('ログインエラー', result.message);
      }
      // 成功時は AuthContext が自動的に画面遷移を処理
    } catch (error) {
      Alert.alert('エラー', 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 新規登録処理
  const handleRegister = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.message);
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.bio
      );
      
      if (result.success) {
        Alert.alert('登録完了', result.message);
        // 成功時は AuthContext が自動的に画面遷移を処理
      } else {
        Alert.alert('登録エラー', result.message);
      }
    } catch (error) {
      Alert.alert('エラー', '登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // メイン処理
  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="balloon-outline" size={48} color="#3399ff" />
              </View>
              <Text style={styles.appName}>Balloon</Text>
              <Text style={styles.appDescription}>
                周辺の投稿を見つけて、つながろう
              </Text>
            </View>
          </View>

          {/* フォーム */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {mode === 'login' ? 'ログイン' : '新規登録'}
              </Text>
              <Text style={styles.formSubtitle}>
                {mode === 'login' 
                  ? 'アカウントにログインしてください' 
                  : '新しいアカウントを作成しましょう'
                }
              </Text>
            </View>

            {/* 新規登録時のみ表示 */}
            {mode === 'register' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>ユーザー名 *</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="ユーザー名を入力"
                      placeholderTextColor="#999"
                      value={formData.username}
                      onChangeText={(value) => updateFormData('username', value)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>自己紹介（任意）</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="text-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, styles.bioInput]}
                      placeholder="自己紹介を入力（任意）"
                      placeholderTextColor="#999"
                      value={formData.bio}
                      onChangeText={(value) => updateFormData('bio', value)}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </>
            )}

            {/* メールアドレス */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>メールアドレス *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="メールアドレスを入力"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* パスワード */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>パスワード *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="パスワードを入力（6文字以上）"
                  placeholderTextColor="#999"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* パスワード確認（新規登録時のみ） */}
            {mode === 'register' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>パスワード確認 *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="パスワードを再入力"
                    placeholderTextColor="#999"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 送信ボタン */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'ログイン' : 'アカウント作成'}
                </Text>
              )}
            </TouchableOpacity>

            {/* モード切り替え */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
              </Text>
              <TouchableOpacity onPress={switchMode} disabled={isLoading}>
                <Text style={styles.switchButton}>
                  {mode === 'login' ? '新規登録' : 'ログイン'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* フッター */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              アカウントを作成することで、利用規約とプライバシーポリシーに同意したものとみなされます。
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#3399ff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3399ff',
    marginLeft: 4,
  },
  footer: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});