import React from 'react';
import { ScrollView, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { SettingItem } from '../../components/SettingItem';
import { useTheme } from '../../context/AppContext';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'> };

/** 设置主页 */
export function SettingsScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.card, marginTop: 12 }}>
        <SettingItem icon="lock-closed" title="账号安全" onPress={() => navigation.navigate('AccountSecurity')} />
        <SettingItem icon="options" title="通用设置" onPress={() => navigation.navigate('GeneralSettings')} />
        <SettingItem icon="eye-off" title="隐私设置" onPress={() => navigation.navigate('PrivacySettings')} />
      </View>
      <View style={{ backgroundColor: colors.card, marginTop: 12 }}>
        <SettingItem icon="help-circle" title="帮助与反馈" onPress={() => navigation.navigate('HelpFeedback')} />
        <SettingItem icon="information-circle" title="关于我们" onPress={() => navigation.navigate('About')} />
      </View>
    </ScrollView>
  );
}
