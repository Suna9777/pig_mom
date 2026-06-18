import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MOCK_FAQ } from '../../data/mockData';
import { useTheme } from '../../context/AppContext';
import { showToast } from '../../utils/feedback';

/** 帮助与反馈 */
export function HelpFeedbackScreen() {
  const { colors, fonts } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const submitFeedback = () => {
    if (!feedback.trim()) { showToast('请输入反馈内容'); return; }
    showToast('反馈已提交，感谢您的建议！');
    setFeedback('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ color: colors.text, fontSize: fonts.lg, fontWeight: '600', marginBottom: 12 }}>常见问题</Text>
      {MOCK_FAQ.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.faqItem, { backgroundColor: colors.card }]}
          onPress={() => setExpanded(expanded === item.id ? null : item.id)}
        >
          <Text style={{ color: colors.text, fontSize: fonts.md, fontWeight: '600' }}>{item.q}</Text>
          {expanded === item.id && (
            <Text style={{ color: colors.textSecondary, fontSize: fonts.sm, marginTop: 8 }}>{item.a}</Text>
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.linkBtn, { backgroundColor: colors.card }]}
        onPress={() => Linking.openURL('mailto:support@pigmom.ccnu.edu.cn')}
      >
        <Text style={{ color: colors.secondary, fontSize: fonts.md }}>📧 客服咨询（发送邮件）</Text>
      </TouchableOpacity>

      <Text style={{ color: colors.text, fontSize: fonts.lg, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
        问题上报
      </Text>
      <TextInput
        style={[styles.textarea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontSize: fonts.md }]}
        value={feedback}
        onChangeText={setFeedback}
        placeholder="描述您遇到的问题..."
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={submitFeedback}>
        <Text style={{ color: '#fff', fontSize: fonts.md }}>提交反馈</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  faqItem: { padding: 14, borderRadius: 10, marginBottom: 8 },
  linkBtn: { padding: 14, borderRadius: 10, marginTop: 16, alignItems: 'center' },
  textarea: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 100 },
  submitBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12, marginBottom: 40 },
});
