import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// Lucide Icons で統一（管理しやすい）
import { Globe, Telescope, Plus, CircleUserRound, Settings } from 'lucide-react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Globe 
              size={size || 28} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? `${color}15` : 'none'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Telescope 
              size={size || 28} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? `${color}15` : 'none'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, size, focused }) => (
            <Plus 
              size={size || 28} 
              color={color}
              strokeWidth={focused ? 3 : 2.5}
              // 投稿ボタンは少し目立たせる
              style={{
                backgroundColor: focused ? `${color}20` : 'transparent',
                borderRadius: 6,
                padding: 2,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <CircleUserRound 
              size={size || 28} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? `${color}15` : 'none'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Settings 
              size={size || 28} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? `${color}15` : 'none'}
            />
          ),
        }}
      />
    </Tabs>
  );
}