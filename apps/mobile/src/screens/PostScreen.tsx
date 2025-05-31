import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Plus, Camera, MapPin, X } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GlobalStyles,
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  StyleUtils
} from '../styles/GlobalStyles';

export default function PostScreen() {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [location, setLocation] = useState('大阪市, 日本');

  const handlePost = () => {
    if (postText.trim()) {
      Alert.alert('投稿完了', '投稿が送信されました！');
      setPostText('');
      setSelectedImage(null);
    } else {
      Alert.alert('エラー', '投稿内容を入力してください');
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      '画像を選択',
      '画像の取得方法を選択してください',
      [
        { text: 'カメラ', onPress: () => console.log('カメラ起動') },
        { text: 'ギャラリー', onPress: () => console.log('ギャラリー起動') },
        { text: 'キャンセル', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={GlobalStyles.container}>
      {/* ヘッダー */}
      <View style={GlobalStyles.header}>
        <Text style={GlobalStyles.headerTitle}>新しい投稿</Text>
        <TouchableOpacity 
          style={styles.postButton}
          onPress={handlePost}
        >
          <Text style={styles.postButtonText}>投稿</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 投稿入力エリア */}
        <View style={[GlobalStyles.card, styles.postCard]}>
          <TextInput
            style={styles.textInput}
            placeholder="今何をしていますか？"
            placeholderTextColor={Colors.textSecondary}
            value={postText}
            onChangeText={setPostText}
            multiline
            maxLength={280}
          />
          
          <Text style={styles.characterCount}>
            {postText.length}/280
          </Text>
        </View>

        {/* 画像プレビュー */}
        {selectedImage && (
          <View style={[GlobalStyles.card, styles.imagePreview]}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <X size={20} color={Colors.textWhite} />
            </TouchableOpacity>
          </View>
        )}

        {/* 位置情報 */}
        <View style={[GlobalStyles.card, styles.locationCard]}>
          <MapPin size={20} color={Colors.primary} />
          <Text style={styles.locationText}>{location}</Text>
          <TouchableOpacity style={styles.changeLocationButton}>
            <Text style={styles.changeLocationText}>変更</Text>
          </TouchableOpacity>
        </View>

        {/* アクションボタン */}
        <View style={[GlobalStyles.card, styles.actionsCard]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleImagePicker}
          >
            <Camera size={24} color={Colors.primary} />
            <Text style={styles.actionText}>写真</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>位置情報</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="happy-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>気分</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  postButtonText: {
    color: Colors.textWhite,
    fontWeight: Typography.fontWeight.semiBold,
  },
  content: {
    flex: 1,
    padding: Spacing.sm,
  },
  postCard: {
    marginBottom: Spacing.md,
  },
  textInput: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: Spacing.sm,
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.round,
    padding: Spacing.xs,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  changeLocationButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  changeLocationText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  actionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  actionText: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});