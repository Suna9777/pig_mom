import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SectionDetailScreen } from '../screens/home/SectionDetailScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { HomeStackParamList } from '../types';
import { useTheme } from '../context/AppContext';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  const { colors, fonts } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: fonts.lg, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: '猪猪妈妈' }} />
      <Stack.Screen name="SectionDetail" component={SectionDetailScreen} options={{ title: '板块详情' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '帖子详情' }} />
    </Stack.Navigator>
  );
}
