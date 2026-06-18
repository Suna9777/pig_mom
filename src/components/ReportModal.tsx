import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { REPORT_REASONS } from '../constants/tags';
import { useTheme } from '../context/AppContext';
import { showToast } from '../utils/feedback';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
}

/** 举报弹窗 */
export function ReportModal({ visible, onClose, onReport }: ReportModalProps) {
  const { colors, fonts } = useTheme();
  const [custom, setCustom] = useState('');

  const handleReport = (reason: string) => {
    onReport(reason);
    showToast('举报已提交，我们会尽快处理');
    setCustom('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text, fontSize: fonts.lg }]}>举报</Text>
          <ScrollView>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[styles.option, { borderColor: colors.border }]}
                onPress={() => handleReport(reason)}
              >
                <Text style={{ color: colors.text, fontSize: fonts.md }}>{reason}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, fontSize: fonts.md }]}
              placeholder="自定义原因..."
              placeholderTextColor={colors.textSecondary}
              value={custom}
              onChangeText={setCustom}
            />
            {custom.length > 0 && (
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={() => handleReport(custom)}>
                <Text style={{ color: '#fff', fontSize: fonts.md }}>提交自定义举报</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={{ color: colors.textSecondary, fontSize: fonts.md }}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  box: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '70%' },
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  option: { paddingVertical: 14, borderBottomWidth: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12 },
  submitBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
});
