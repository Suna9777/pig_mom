import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { CommunityStack } from './CommunityStack';
import { ProfileStack } from './ProfileStack';
import { useApp, useTheme } from '../context/AppContext';

const Tab = createBottomTabNavigator();

/** 底部 Tab 导航 */
export function MainTabs() {
  const { colors } = useTheme();
  const { unreadCount } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeTab: 'home',
            CommunityTab: 'people',
            ProfileTab: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: '首页' }} />
      <Tab.Screen name="CommunityTab" component={CommunityStack} options={{ title: '社群' }} />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: '我的',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}
