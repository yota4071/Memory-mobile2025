import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=3' }} // 仮のアバター画像
          style={styles.avatar}
        />
        <Text style={styles.name}>Yota Ozawa</Text>
        <Text style={styles.bio}>情報科学の学生。旅行と技術が好き。</Text>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>プロフィールを編集</Text>
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