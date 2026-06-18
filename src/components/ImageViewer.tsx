import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

interface ImageViewerModalProps {
  images: string[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
}

/** 图片点击放大预览 */
export function ImageViewerModal({ images, visible, initialIndex = 0, onClose }: ImageViewerModalProps) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(initialIndex);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: index * width, y: 0 }}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {images.map((uri, i) => (
            <View key={i} style={styles.slide}>
              <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
        {images.length > 1 && (
          <Text style={styles.indicator}>
            {index + 1} / {images.length}
          </Text>
        )}
      </View>
    </Modal>
  );
}

/** 图片网格（可点击放大） */
export function ImageGrid({ images }: { images: string[] }) {
  const [visible, setVisible] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <>
      <View style={gridStyles.grid}>
        {images.map((uri, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setStartIndex(i);
              setVisible(true);
            }}
          >
            <Image source={{ uri }} style={gridStyles.thumb} />
          </TouchableOpacity>
        ))}
      </View>
      <ImageViewerModal
        images={images}
        visible={visible}
        initialIndex={startIndex}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  slide: { width, height, justifyContent: 'center', alignItems: 'center' },
  image: { width: width - 32, height: height * 0.7 },
  indicator: { position: 'absolute', bottom: 60, alignSelf: 'center', color: '#fff', fontSize: 16 },
});

const gridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  thumb: { width: 100, height: 100, borderRadius: 8 },
});
