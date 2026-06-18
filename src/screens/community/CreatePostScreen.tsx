import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { CommunityStackParamList, PostType, SectionId } from '../../types';
import { SECTIONS } from '../../constants/sections';
import { PRESET_TAGS } from '../../constants/tags';
import { useApp, useTheme } from '../../context/AppContext';
import { showToast, showFeedback } from '../../utils/feedback';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'CreatePost'>;
  route: RouteProp<CommunityStackParamList, 'CreatePost'>;
};

const POST_TYPES: { key: PostType; label: string }[] = [
  { key: 'help', label: '求助' },
  { key: 'share', label: '分享' },
  { key: 'trade', label: '交易' },
];

/** 发布帖子页 */
export function CreatePostScreen({ navigation, route }: Props) {
  const { colors, fonts } = useTheme();
  const { publishPost, saveDraft, state, removeDraft } = useApp();
  const draft = route.params?.draftId ? state.drafts.find((d) => d.id === route.params.draftId) : undefined;

  const [type, setType] = useState<PostType>(draft?.type || 'share');
  const [sectionId, setSectionId] = useState<SectionId>(draft?.sectionId || 'life');
  const [title, setTitle] = useState(draft?.title || '');
  const [content, setContent] = useState(draft?.content || '');
  const [images, setImages] = useState<string[]>(draft?.images || []);
  const [tags, setTags] = useState<string[]>(draft?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    if (images.length >= 9) {
      showToast('最多上传9张图片');
      return;
    }
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showToast('需要相机/相册权限');
      return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true, selectionLimit: 9 - images.length });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 9));
      showFeedback('图片已添加');
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else if (tags.length < 3) {
      setTags([...tags, tag]);
    } else {
      showToast('最多选择3个标签');
    }
  };

  const addCustomTag = () => {
    if (!customTag.trim()) return;
    toggleTag(customTag.trim());
    setCustomTag('');
  };

  const handleSaveDraft = async () => {
    await saveDraft({ id: draft?.id, type, sectionId, title, content, images, tags });
    showToast('草稿已保存');
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('请填写标题和内容');
      return;
    }
    setSubmitting(true);
    try {
      await publishPost({ type, sectionId, title: title.trim(), content: content.trim(), images, tags });
      if (draft?.id) await removeDraft(draft.id);
      showToast('发布成功');
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 16 }}>
      {/* 类型选择 */}
      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md }]}>帖子类型</Text>
      <View style={styles.row}>
        {POST_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.chip, { backgroundColor: type === t.key ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setType(t.key)}
          >
            <Text style={{ color: type === t.key ? '#fff' : colors.text, fontSize: fonts.sm }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 板块选择 */}
      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md }]}>所属板块</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.chip, { backgroundColor: sectionId === s.id ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setSectionId(s.id)}
          >
            <Text style={{ color: sectionId === s.id ? '#fff' : colors.text, fontSize: fonts.sm }}>{s.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md }]}>标题</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, fontSize: fonts.md, backgroundColor: colors.card }]}
        value={title}
        onChangeText={setTitle}
        placeholder="输入标题"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md }]}>内容</Text>
      <TextInput
        style={[styles.textarea, { color: colors.text, borderColor: colors.border, fontSize: fonts.md, backgroundColor: colors.card }]}
        value={content}
        onChangeText={setContent}
        placeholder="输入内容..."
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {/* 图片 */}
      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md }]}>图片（最多9张）</Text>
      <View style={styles.imageRow}>
        {images.map((uri, i) => (
          <View key={i} style={styles.imageWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <TouchableOpacity style={styles.removeImg} onPress={() => setImages(images.filter((_, idx) => idx !== i))}>
              <Text style={{ color: '#fff', fontSize: 12 }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 9 && (
          <>
            <TouchableOpacity style={[styles.addImg, { borderColor: colors.border }]} onPress={() => pickImage(false)}>
              <Text style={{ color: colors.textSecondary, fontSize: fonts.sm }}>相册</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addImg, { borderColor: colors.border }]} onPress={() => pickImage(true)}>
              <Text style={{ color: colors.textSecondary, fontSize: fonts.sm }}>拍照</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 标签 */}
      <Text style={[styles.label, { color: colors.text, fontSize: fonts.md }]}>标签（最多3个）</Text>
      <View style={styles.row}>
        {PRESET_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.chip, { backgroundColor: tags.includes(tag) ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => toggleTag(tag)}
          >
            <Text style={{ color: tags.includes(tag) ? '#fff' : colors.text, fontSize: fonts.sm }}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.customTagRow}>
        <TextInput
          style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, fontSize: fonts.sm, backgroundColor: colors.card }]}
          value={customTag}
          onChangeText={setCustomTag}
          placeholder="自定义标签"
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity style={[styles.addTagBtn, { backgroundColor: colors.secondary }]} onPress={addCustomTag}>
          <Text style={{ color: '#fff', fontSize: fonts.sm }}>添加</Text>
        </TouchableOpacity>
      </View>

      {/* 按钮 */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleSaveDraft}>
          <Text style={{ color: colors.text, fontSize: fonts.md }}>存草稿</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={{ color: '#fff', fontSize: fonts.md, fontWeight: '600' }}>{submitting ? '发布中...' : '发布'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { fontWeight: '600', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionScroll: { marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  textarea: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 120 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageWrap: { position: 'relative' },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  removeImg: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addImg: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  customTagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addTagBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  btn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
});
