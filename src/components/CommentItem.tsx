import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Comment } from '../types';
import { useTheme } from '../context/AppContext';
import { formatRelativeTime } from '../utils/helpers';

const MAX_DEPTH = 3;
const INDENT = 20;

interface CommentItemProps {
  comment: Comment;
  depth: number;
  postId: string;
  defaultAuthorName: string;
  onReply: (parentId: string, authorName: string, content: string) => Promise<void>;
  onReport: (commentId: string) => void;
}

/** 单条评论（递归渲染子回复） */
export function CommentItem({
  comment,
  depth,
  postId,
  defaultAuthorName,
  onReply,
  onReport,
}: CommentItemProps) {
  const { colors, fonts } = useTheme();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyName, setReplyName] = useState(defaultAuthorName);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canReply = depth < MAX_DEPTH;

  const handleSubmitReply = async () => {
    const name = replyName.trim();
    const content = replyContent.trim();
    if (!name || !content) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, name, content);
      setReplyContent('');
      setReplyName(defaultAuthorName);
      setShowReplyForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ marginLeft: (depth - 1) * INDENT }}>
      <View style={[styles.comment, { backgroundColor: colors.card }]}>
        <View style={styles.commentHeader}>
          <Text style={{ color: colors.text, fontSize: fonts.sm, fontWeight: '600' }}>
            {comment.authorName}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: fonts.sm, marginTop: 4 }}>{comment.content}</Text>
        <View style={styles.commentActions}>
          {canReply && (
            <TouchableOpacity onPress={() => setShowReplyForm((v) => !v)}>
              <Text style={{ color: colors.primary, fontSize: fonts.xs }}>回复</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onReport(comment.id)}>
            <Text style={{ color: colors.textSecondary, fontSize: fonts.xs }}>举报</Text>
          </TouchableOpacity>
        </View>

        {showReplyForm && canReply && (
          <View style={[styles.replyForm, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.replyInput, { color: colors.text, borderColor: colors.border, fontSize: fonts.sm }]}
              placeholder="你的姓名"
              placeholderTextColor={colors.textSecondary}
              value={replyName}
              onChangeText={setReplyName}
            />
            <TextInput
              style={[
                styles.replyTextarea,
                { color: colors.text, borderColor: colors.border, fontSize: fonts.sm },
              ]}
              placeholder="写下回复…"
              placeholderTextColor={colors.textSecondary}
              value={replyContent}
              onChangeText={setReplyContent}
              multiline
            />
            <TouchableOpacity
              style={[styles.replySubmit, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
              onPress={handleSubmitReply}
              disabled={submitting}
            >
              <Text style={{ color: '#fff', fontSize: fonts.sm, fontWeight: '600' }}>提交</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {comment.replies.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          depth={depth + 1}
          postId={postId}
          defaultAuthorName={defaultAuthorName}
          onReply={onReply}
          onReport={onReport}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  comment: { marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 8 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentActions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  replyForm: { marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  replyInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  replyTextarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  replySubmit: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
