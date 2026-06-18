import AsyncStorage from '@react-native-async-storage/async-storage';

/** 通用存储读写封装 */
export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.clear();
}

/** 追加到数组头部，限制最大长度 */
export async function prependToList<T>(
  key: string,
  item: T,
  maxLength = 50
): Promise<T[]> {
  const list = await getItem<T[]>(key, []);
  const filtered = list.filter((i) => JSON.stringify(i) !== JSON.stringify(item));
  const updated = [item, ...filtered].slice(0, maxLength);
  await setItem(key, updated);
  return updated;
}
