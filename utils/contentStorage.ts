import AsyncStorage from "@react-native-async-storage/async-storage";

export type ContentKind = "recipe" | "encyclopedia";

export type ContentRef = {
  kind: ContentKind;
  id: string;
  label: string;
  emoji: string;
  viewedAt: number;
};

const FAVORITES_KEY = "@content_favorites";
const RECENT_KEY = "@recent_content";
const MAX_RECENT = 12;

const makeKey = (kind: ContentKind, id: string) => `${kind}:${id}`;

const readRefs = async (key: string): Promise<ContentRef[]> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ContentRef[]) : [];
  } catch (error) {
    console.warn("Failed to read content refs:", error);
    return [];
  }
};

const writeRefs = async (key: string, refs: ContentRef[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(refs));
  } catch (error) {
    console.warn("Failed to write content refs:", error);
  }
};

export const getFavorites = async (): Promise<ContentRef[]> => readRefs(FAVORITES_KEY);

export const getRecentContent = async (): Promise<ContentRef[]> => readRefs(RECENT_KEY);

export const isFavorite = async (kind: ContentKind, id: string): Promise<boolean> => {
  const favorites = await getFavorites();
  const key = makeKey(kind, id);
  return favorites.some((item) => makeKey(item.kind, item.id) === key);
};

export const toggleFavorite = async (item: ContentRef): Promise<boolean> => {
  const favorites = await getFavorites();
  const key = makeKey(item.kind, item.id);
  const exists = favorites.some((favorite) => makeKey(favorite.kind, favorite.id) === key);

  if (exists) {
    await writeRefs(
      FAVORITES_KEY,
      favorites.filter((favorite) => makeKey(favorite.kind, favorite.id) !== key)
    );
    return false;
  }

  await writeRefs(FAVORITES_KEY, [{ ...item, viewedAt: Date.now() }, ...favorites]);
  return true;
};

export const addRecentContent = async (item: ContentRef): Promise<void> => {
  const recent = await getRecentContent();
  const key = makeKey(item.kind, item.id);
  const next = [
    { ...item, viewedAt: Date.now() },
    ...recent.filter((recentItem) => makeKey(recentItem.kind, recentItem.id) !== key),
  ].slice(0, MAX_RECENT);

  await writeRefs(RECENT_KEY, next);
};
