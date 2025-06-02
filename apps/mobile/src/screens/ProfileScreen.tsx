import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  TextInput, Alert
} from 'react-native';

const API_BASE_URL = 'http://192.168.100.98:3001/dev/api/accounts'; // ← あなたのIPアドレスに変更済み

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async () => {
    if (!username) {
      Alert.alert('エラー', 'ユーザー名を入力してください');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, bio }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('成功', `アカウント登録成功: ID=${data.id}`);
      } else {
        Alert.alert('エラー', data.error || '登録に失敗しました');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', 'ネットワークエラーが発生しました');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Yota Ozawa</Text>
        <Text style={styles.bio}>情報科学の学生。旅行と技術が好き。</Text>

        <TextInput
          style={styles.input}
          placeholder="ユーザー名"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="自己紹介"
          value={bio}
          onChangeText={setBio}
        />

        <TouchableOpacity style={styles.editButton} onPress={handleSubmit}>
          <Text style={styles.editText}>プロフィール登録</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    paddingTop: 60,
  },
  profileContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#3399ff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  editText: {
    color: 'white',
    fontWeight: '600',
  },
});