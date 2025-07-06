import { EmojiPicker } from './EmojiPicker';
import { EmojiData } from './types';

class EmojiPickerExtension {
  private emojiPicker: EmojiPicker | null = null;
  private emojisData: EmojiData[] = [];
  private isLoading = false;
  private debug = true; // デバッグモード

  constructor() {
    this.log('EmojiPickerExtension initializing...');
    this.init();
  }

  private log(message: string, ...args: any[]) {
    if (this.debug) {
      console.log(`[EmojiPicker] ${message}`, ...args);
    }
  }

  private async init() {
    await this.loadEmojiData();
    this.setupEventListeners();
  }

  private async loadEmojiData() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      this.log('Loading emoji data...');
      const response = await fetch(chrome.runtime.getURL('data/emojis.json'));
      this.emojisData = await response.json();
      this.log(`Loaded ${this.emojisData.length} emojis`);
    } catch (error) {
      console.error('Failed to load emoji data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private setupEventListeners() {
    document.addEventListener('input', this.handleInput.bind(this));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
  }

  private handleInput(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.isValidInputElement(target)) return;

    let textValue = '';
    let cursorPosition = 0;
    
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      const inputElement = target as HTMLInputElement | HTMLTextAreaElement;
      textValue = inputElement.value || '';
      cursorPosition = inputElement.selectionStart || 0;
    } else if (target.contentEditable === 'true') {
      // contenteditable要素の場合
      textValue = target.textContent || '';
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        cursorPosition = range.startOffset;
      }
    } else {
      return;
    }

    this.log(`Input detected: "${textValue}", cursor at ${cursorPosition}`);
    
    const textBeforeCursor = textValue.substring(0, cursorPosition);
    const colonMatch = textBeforeCursor.match(/:([^:\s]*)$/);

    if (colonMatch) {
      const query = colonMatch[1];
      const colonPosition = cursorPosition - query.length - 1;
      this.log(`Colon detected with query: "${query}"`);
      this.showEmojiPicker(target as HTMLInputElement | HTMLTextAreaElement, colonPosition, query);
    } else {
      this.hideEmojiPicker();
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.emojiPicker && this.emojiPicker.isVisible()) {
      const handled = this.emojiPicker.handleKeydown(event);
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.emojiPicker && this.emojiPicker.isVisible()) {
      if (!this.emojiPicker.contains(target)) {
        this.hideEmojiPicker();
      }
    }
  }

  private isValidInputElement(element: HTMLElement): boolean {
    this.log(`Checking element: ${element.tagName}, contentEditable: ${element.contentEditable}`);
    
    if (element.tagName === 'INPUT') {
      const inputType = (element as HTMLInputElement).type;
      const validTypes = ['text', 'search', 'url', 'email', 'password'];
      return validTypes.includes(inputType);
    }
    
    if (element.tagName === 'TEXTAREA') {
      return true;
    }
    
    // contenteditable要素（Twitterのツイートボックスなど）
    if (element.contentEditable === 'true') {
      return true;
    }
    
    return false;
  }

  private showEmojiPicker(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement, colonPosition: number, query: string) {
    if (!this.emojiPicker) {
      this.emojiPicker = new EmojiPicker(this.emojisData, this.onEmojiSelect.bind(this));
    }

    this.emojiPicker.show(inputElement, colonPosition, query);
  }

  private hideEmojiPicker() {
    if (this.emojiPicker) {
      this.emojiPicker.hide();
    }
  }

  private onEmojiSelect(emoji: string, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement, colonPosition: number) {
    if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA') {
      const input = inputElement as HTMLInputElement | HTMLTextAreaElement;
      const currentValue = input.value;
      const cursorPosition = input.selectionStart || 0;
      
      // Find the end of the emoji query (current cursor position)
      const beforeColon = currentValue.substring(0, colonPosition);
      const afterCursor = currentValue.substring(cursorPosition);
      
      // Replace the :query with the emoji
      const newValue = beforeColon + emoji + afterCursor;
      input.value = newValue;
      
      // Set cursor position after the emoji
      const newCursorPosition = beforeColon.length + emoji.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
      
      // Trigger input event to notify other scripts
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (inputElement.contentEditable === 'true') {
      // contenteditable要素の場合
      const currentText = inputElement.textContent || '';
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const cursorPosition = range.startOffset;
        
        const beforeColon = currentText.substring(0, colonPosition);
        const afterCursor = currentText.substring(cursorPosition);
        
        const newText = beforeColon + emoji + afterCursor;
        inputElement.textContent = newText;
        
        // Set cursor position after the emoji
        const newCursorPosition = beforeColon.length + emoji.length;
        const newRange = document.createRange();
        newRange.setStart(inputElement.firstChild || inputElement, newCursorPosition);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Trigger input event
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    
    this.hideEmojiPicker();
  }
}

// Initialize the extension
new EmojiPickerExtension();