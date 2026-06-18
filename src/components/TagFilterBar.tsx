import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/AppContext';

interface TagFilterBarProps {
  tags: string[];
  selected: string;
  onSelect: (tag: string) => void;
}

/** 横向标签筛选栏 */
export function TagFilterBar({ tags, selected, onSelect }: TagFilterBarProps) {
  const { colors, fonts } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {tags.map((tag) => {
        const active = tag === selected;
        return (
          <TouchableOpacity
            key={tag}
            style={[
              styles.chip,
              { backgroundColor: active ? colors.primary : colors.card, borderColor: colors.border },
            ]}
            onPress={() => onSelect(tag)}
          >
            <Text style={{ color: active ? '#fff' : colors.text, fontSize: fonts.sm, fontWeight: active ? '600' : '400' }}>
              {tag}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { maxHeight: 44, marginVertical: 8 },
  content: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
});
