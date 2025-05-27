import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>設定</Text>

      <View style={styles.item}>
        <Ionicons name="notifications-outline" size={24} color="#333" style={styles.icon} />
        <Text style={styles.label}>通知</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="lock-closed-outline" size={24} color="#333" style={styles.icon} />
        <Text style={styles.label}>パスワード変更</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons name="log-out-outline" size={24} color="red" style={styles.icon} />
        <Text style={[styles.label, { color: 'red' }]}>ログアウト</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
});