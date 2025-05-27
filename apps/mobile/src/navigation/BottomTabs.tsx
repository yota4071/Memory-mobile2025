import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
            let iconName: string;
          
            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Profile':
                iconName = 'person';
                break;
              case 'Settings':
                iconName = 'settings';
                break;
              default:
                iconName = 'help-circle'; // 予期せぬ場合の保険
            }
          
            return <Ionicons name={iconName} size={size} color={color} />;
          },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}