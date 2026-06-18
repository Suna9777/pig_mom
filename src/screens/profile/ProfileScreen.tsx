import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../types';
import { SettingItem } from '../../components/SettingItem';
import { useApp, useTheme } from '../../context/AppContext';
import { showToast, showFeedback } from '../../utils/feedback';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'> };

/** 个人中心 */
export function ProfileScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { state, updateUser, unreadCount } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [nickname, setNickname] = useState(state.user.nickname);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { showToast('需要相册权限'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) {
      await updateUser({ avatar: result.assets[0].uri });
      showFeedback('头像已更新');
    }
  };

  const saveNickname = async () => {
    if (nickname.trim()) {
      await updateUser({ nickname: nickname.trim() });
      showToast('昵称已更新');
    }
    setEditingName(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView>
        {/* 个人信息 */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={pickAvatar}>
            {state.user.avatar ? (
              <Image source={{ uri: state.user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
            )}
            <Text style={{ color: colors.primary, fontSize: fonts.xs, textAlign: 'center', marginTop: 4 }}>更换头像</Text>
          </TouchableOpacity>
          <View style={styles.info}>
            {editingName ? (
              <View style={styles.nameEdit}>
                <TextInput
                  style={{ color: colors.text, fontSize: fonts.lg, borderBottomWidth: 1, borderColor: colors.primary, flex: 1 }}
                  value={nickname}
                  onChangeText={setNickname}
                  autoFocus
                />
                <TouchableOpacity onPress={saveNickname}>
                  <Text style={{ color: colors.primary, fontSize: fonts.sm }}>保存</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={{ color: colors.text, fontSize: fonts.xl, fontWeight: '700' }}>{state.user.nickname}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>点击编辑昵称</Text>
              </TouchableOpacity>
            )}
            <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 4 }}>ID: {state.user.id}</Text>
          </View>
        </View>

        {/* 功能列表 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SettingItem icon="document-text" title="我的提问" onPress={() => navigation.navigate('MyPosts')} />
          <SettingItem icon="star" title="收藏问题" onPress={() => navigation.navigate('Favorites')} />
          <SettingItem icon="create" title="草稿箱" subtitle={`${state.drafts.length} 篇草稿`} onPress={() => navigation.navigate('Drafts')} />
          <SettingItem icon="time" title="浏览历史" onPress={() => navigation.navigate('History')} />
          <SettingItem icon="heart" title="点赞/评论记录" onPress={() => navigation.navigate('LikesComments')} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, marginTop: 12 }]}>
          <SettingItem icon="people" title="关注" onPress={() => navigation.navigate('Follow')} />
          <SettingItem
            icon="notifications"
            title="系统通知"
            subtitle={unreadCount > 0 ? `${unreadCount} 条未读` : undefined}
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, marginTop: 12 }]}>
          <SettingItem icon="settings" title="设置" onPress={() => navigation.navigate('Settings')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  info: { marginLeft: 16, flex: 1 },
  nameEdit: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  section: { marginTop: 12 },
});
