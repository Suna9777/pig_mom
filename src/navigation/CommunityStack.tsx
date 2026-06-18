import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunityScreen } from '../screens/community/CommunityScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { CreatePostScreen } from '../screens/community/CreatePostScreen';
import { CommunityStackParamList } from '../types';
import { useTheme } from '../context/AppContext';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export function CommunityStack() {
  const { colors, fonts } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: fonts.lg, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Community" component={CommunityScreen} options={{ title: '社群' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '帖子详情' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: '发布帖子' }} />
    </Stack.Navigator>
  );
}
