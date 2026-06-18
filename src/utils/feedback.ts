import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

/** 显示 Toast 式提示（使用 Alert 简化实现） */
export function showToast(message: string) {
  Alert.alert('提示', message, [{ text: '好的' }], { cancelable: true });
}

/** 轻量提示（不阻塞） */
export function showFeedback(message: string, haptic = true) {
  if (haptic) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
  // 使用 console 作为非阻塞反馈，UI 层可配合 Snackbar
  console.log('[Feedback]', message);
}

/** 确认对话框 */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void
) {
  Alert.alert(title, message, [
    { text: '取消', style: 'cancel' },
    { text: '确定', onPress: onConfirm },
  ]);
}
