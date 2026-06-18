import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Section } from '../types';
import { useTheme } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

interface SectionCardProps {
  section: Section;
  onPress: () => void;
}

/** 板块入口卡片 */
export function SectionCard({ section, onPress }: SectionCardProps) {
  const { colors, fonts } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: section.color + '22' }]}>
        <Ionicons name={section.icon as keyof typeof Ionicons.glyphMap} size={24} color={section.color} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: fonts.sm }]} numberOfLines={2}>
        {section.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { textAlign: 'center', fontWeight: '600' },
});
