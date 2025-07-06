import { EmojiData, EmojiPickerOptions } from './types';

export class EmojiPicker {
  private container: HTMLElement | null = null;
  private emojisData: EmojiData[];
  private filteredEmojis: EmojiData[] = [];
  private selectedIndex = 0;
  private onSelectCallback: (emoji: string, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement, colonPosition: number) => void;
  private currentInputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement | null = null;
  private currentColonPosition = 0;
  private options: EmojiPickerOptions;

  constructor(
    emojisData: EmojiData[],
    onSelectCallback: (emoji: string, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement, colonPosition: number) => void,
    options: EmojiPickerOptions = {}
  ) {
    this.emojisData = emojisData;
    this.onSelectCallback = onSelectCallback;
    this.options = {
      maxResults: 10,
      caseSensitive: false,
      ...options
    };
  }

  public show(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement, colonPosition: number, query: string) {
    this.currentInputElement = inputElement;
    this.currentColonPosition = colonPosition;
    this.filteredEmojis = this.filterEmojis(query);
    this.selectedIndex = 0;

    if (this.filteredEmojis.length === 0) {
      this.hide();
      return;
    }

    this.createContainer();
    this.renderEmojis();
    this.positionContainer(inputElement, colonPosition);
    this.updateSelection();
  }

  public hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.currentInputElement = null;
  }

  public isVisible(): boolean {
    return this.container !== null;
  }

  public contains(element: HTMLElement): boolean {
    return this.container ? this.container.contains(element) : false;
  }

  public handleKeydown(event: KeyboardEvent): boolean {
    if (!this.isVisible()) return false;

    switch (event.key) {
      case 'ArrowDown':
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredEmojis.length - 1);
        this.updateSelection();
        return true;
      case 'ArrowUp':
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateSelection();
        return true;
      case 'Enter':
        this.selectEmoji(this.selectedIndex);
        return true;
      case 'Escape':
        this.hide();
        return true;
      default:
        return false;
    }
  }

  private filterEmojis(query: string): EmojiData[] {
    if (!query) {
      return this.emojisData.slice(0, this.options.maxResults);
    }

    const searchQuery = this.options.caseSensitive ? query : query.toLowerCase();
    const results: EmojiData[] = [];

    for (const emoji of this.emojisData) {
      const name = this.options.caseSensitive ? emoji.name : emoji.name.toLowerCase();
      const keywords = this.options.caseSensitive ? emoji.keywords : emoji.keywords.map(k => k.toLowerCase());

      if (name.includes(searchQuery) || keywords.some(keyword => keyword.includes(searchQuery))) {
        results.push(emoji);
        if (results.length >= (this.options.maxResults || 10)) break;
      }
    }

    return results;
  }

  private createContainer() {
    if (this.container) {
      this.container.remove();
    }

    this.container = document.createElement('div');
    this.container.className = 'emoji-picker-container';
    this.container.style.cssText = `
      position: absolute;
      z-index: 10000;
      background: #36393f;
      border: 1px solid #202225;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
      max-height: 200px;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      min-width: 200px;
    `;

    document.body.appendChild(this.container);
  }

  private renderEmojis() {
    if (!this.container) return;

    this.container.innerHTML = '';

    this.filteredEmojis.forEach((emoji, index) => {
      const emojiElement = document.createElement('div');
      emojiElement.className = 'emoji-picker-item';
      emojiElement.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.1s;
      `;

      emojiElement.innerHTML = `
        <span style="font-size: 16px;">${emoji.emoji}</span>
        <span style="color: #dcddde;">:${emoji.name}:</span>
      `;

      emojiElement.addEventListener('click', () => {
        this.selectEmoji(index);
      });

      emojiElement.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });

      this.container!.appendChild(emojiElement);
    });
  }

  private positionContainer(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement, colonPosition: number) {
    if (!this.container) return;

    const rect = inputElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Position below the input element
    const top = rect.bottom + scrollTop + 4;
    const left = rect.left + scrollLeft;

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;

    // Adjust if container goes off-screen
    const containerRect = this.container.getBoundingClientRect();
    if (containerRect.right > window.innerWidth) {
      this.container.style.left = `${window.innerWidth - containerRect.width - 10}px`;
    }
    if (containerRect.bottom > window.innerHeight) {
      this.container.style.top = `${rect.top + scrollTop - containerRect.height - 4}px`;
    }
  }

  private updateSelection() {
    if (!this.container) return;

    const items = this.container.querySelectorAll('.emoji-picker-item');
    items.forEach((item, index) => {
      const element = item as HTMLElement;
      if (index === this.selectedIndex) {
        element.style.backgroundColor = '#5865f2';
        element.style.color = '#ffffff';
      } else {
        element.style.backgroundColor = 'transparent';
        element.style.color = '#dcddde';
      }
    });
  }

  private selectEmoji(index: number) {
    if (!this.currentInputElement || index < 0 || index >= this.filteredEmojis.length) return;

    const selectedEmoji = this.filteredEmojis[index];
    this.onSelectCallback(selectedEmoji.emoji, this.currentInputElement, this.currentColonPosition);
  }
}