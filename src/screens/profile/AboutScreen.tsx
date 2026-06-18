import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, Modal, View } from 'react-native';
import { USER_AGREEMENT, PRIVACY_POLICY } from '../../data/mockData';
import { APP_VERSION } from '../../constants/theme';
import { useTheme } from '../../context/AppContext';

/** 关于我们 */
export function AboutScreen() {
  const { colors, fonts } = useTheme();
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={{ fontSize: 48 }}>🐷</Text>
        <Text style={{ color: colors.text, fontSize: fonts.xxl, fontWeight: '700', marginTop: 8 }}>猪猪妈妈</Text>
        <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 4 }}>
          华中师范大学校园生活全能指南
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 4 }}>
          版本 {APP_VERSION}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.item, { backgroundColor: colors.card }]}
        onPress={() => setModalContent({ title: '用户协议', body: USER_AGREEMENT })}
      >
        <Text style={{ color: colors.text, fontSize: fonts.md }}>用户协议</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.item, { backgroundColor: colors.card }]}
        onPress={() => setModalContent({ title: '隐私政策', body: PRIVACY_POLICY })}
      >
        <Text style={{ color: colors.text, fontSize: fonts.md }}>隐私政策</Text>
      </TouchableOpacity>

      <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, textAlign: 'center', marginTop: 24 }}>
        © 2026 猪猪妈妈 · 服务范围：武汉市
      </Text>

      <Modal visible={!!modalContent} transparent animationType="slide" onRequestClose={() => setModalContent(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontSize: fonts.lg, fontWeight: '700', marginBottom: 12 }}>
              {modalContent?.title}
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={{ color: colors.text, fontSize: fonts.sm, lineHeight: 22 }}>{modalContent?.body}</Text>
            </ScrollView>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.primary }]} onPress={() => setModalContent(null)}>
              <Text style={{ color: '#fff', fontSize: fonts.md }}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', padding: 32, borderRadius: 12, marginBottom: 16 },
  item: { padding: 16, borderRadius: 10, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalBox: { borderRadius: 12, padding: 20 },
  closeBtn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
});
