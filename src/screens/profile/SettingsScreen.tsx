import React, { useState } from 'react';
import { ScrollView, View, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { SettingItem } from '../../components/SettingItem';
import { useTheme } from '../../context/AppContext';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'> };

/** 设置主页 */
export function SettingsScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const [accountSecurityVisible, setAccountSecurityVisible] = useState(false);

  return (
    <>
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.card, marginTop: 12 }}>
        <SettingItem icon="lock-closed" title="账号安全" onPress={() => setAccountSecurityVisible(true)} />
        <SettingItem icon="options" title="通用设置" onPress={() => navigation.navigate('GeneralSettings')} />
        <SettingItem icon="eye-off" title="隐私设置" onPress={() => navigation.navigate('PrivacySettings')} />
      </View>
      <View style={{ backgroundColor: colors.card, marginTop: 12 }}>
        <SettingItem icon="help-circle" title="帮助与反馈" onPress={() => navigation.navigate('HelpFeedback')} />
        <SettingItem icon="information-circle" title="关于我们" onPress={() => navigation.navigate('About')} />
      </View>
    </ScrollView>

    <Modal
      visible={accountSecurityVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setAccountSecurityVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setAccountSecurityVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={{ color: colors.text, fontSize: fonts.lg, fontWeight: '700' }}>账号安全</Text>
                <TouchableOpacity onPress={() => setAccountSecurityVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={{ color: colors.textSecondary, fontSize: fonts.md, textAlign: 'center' }}>
                  功能开发中，敬请期待…
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalBody: { padding: 32, alignItems: 'center' },
});
