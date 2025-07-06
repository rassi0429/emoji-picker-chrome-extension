export interface EmojiData {
  name: string;
  emoji: string;
  keywords: string[];
}

export interface EmojiPickerOptions {
  maxResults?: number;
  caseSensitive?: boolean;
}