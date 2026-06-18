import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MyPostsScreen } from '../screens/profile/MyPostsScreen';
import { FavoritesScreen } from '../screens/profile/FavoritesScreen';
import { DraftsScreen } from '../screens/profile/DraftsScreen';
import { HistoryScreen } from '../screens/profile/HistoryScreen';
import { LikesCommentsScreen } from '../screens/profile/LikesCommentsScreen';
import { FollowScreen } from '../screens/profile/FollowScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { AccountSecurityScreen } from '../screens/profile/AccountSecurityScreen';
import { GeneralSettingsScreen } from '../screens/profile/GeneralSettingsScreen';
import { PrivacySettingsScreen } from '../screens/profile/PrivacySettingsScreen';
import { HelpFeedbackScreen } from '../screens/profile/HelpFeedbackScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { CreatePostScreen } from '../screens/community/CreatePostScreen';
import { ProfileStackParamList } from '../types';
import { useTheme } from '../context/AppContext';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  const { colors, fonts } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: fonts.lg, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} options={{ title: '我的提问' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: '收藏问题' }} />
      <Stack.Screen name="Drafts" component={DraftsScreen} options={{ title: '草稿箱' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: '浏览历史' }} />
      <Stack.Screen name="LikesComments" component={LikesCommentsScreen} options={{ title: '点赞/评论记录' }} />
      <Stack.Screen name="Follow" component={FollowScreen} options={{ title: '关注' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: '系统通知' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
      <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} options={{ title: '账号安全' }} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} options={{ title: '通用设置' }} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: '隐私设置' }} />
      <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen} options={{ title: '帮助与反馈' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: '关于我们' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: '编辑草稿' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '帖子详情' }} />
    </Stack.Navigator>
  );
}
