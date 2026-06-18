import React, { useState } from 'react';
import { ScrollView, TextInput, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp, useTheme } from '../../context/AppContext';
import { showConfirm, showToast } from '../../utils/feedback';
import { COLORS } from '../../constants/theme';

/** 账号安全 */
export function AccountSecurityScreen() {
  const { colors, fonts } = useTheme();
  const { state, updateUser, logout } = useApp();
  const [password, setPassword] = useState(state.user.password || '');
  const [phone, setPhone] = useState(state.user.phone || '');

  const savePassword = async () => {
    await updateUser({ password });
    showToast('密码已更新（模拟）');
  };

  const bindPhone = async () => {
    if (!phone.trim()) { showToast('请输入手机号'); return; }
    await updateUser({ phone: phone.trim() });
    showToast('手机号已绑定（模拟）');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md }]}>修改密码</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontSize: fonts.md }]}
        value={password}
        onChangeText={setPassword}
        placeholder="输入新密码"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={savePassword}>
        <Text style={{ color: '#fff', fontSize: fonts.md }}>保存密码</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md, marginTop: 24 }]}>绑定手机号</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontSize: fonts.md }]}
        value={phone}
        onChangeText={setPhone}
        placeholder="输入手机号"
        placeholderTextColor={colors.textSecondary}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.secondary }]} onPress={bindPhone}>
        <Text style={{ color: '#fff', fontSize: fonts.md }}>绑定手机</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.card, borderColor: COLORS.danger, borderWidth: 1, marginTop: 40 }]}
        onPress={() =>
          showConfirm('退出登录', '将清除所有本地数据，确定退出？', logout)
        }
      >
        <Text style={{ color: COLORS.danger, fontSize: fonts.md }}>退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  btn: { padding: 14, borderRadius: 8, alignItems: 'center' },
});
