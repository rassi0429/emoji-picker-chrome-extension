# Emoji Picker Chrome Extension

Discord風の絵文字ピッカーChrome拡張機能です。

## 機能

- `:` 文字を入力すると絵文字ピッカーが表示されます
- リアルタイムでの絵文字検索・フィルタリング
- キーボードナビゲーション（矢印キー、Enter、Escape）
- マウスでの選択
- Discord風のUI設計

## 対応要素

- `<input type="text">` 
- `<textarea>`
- `contenteditable` 要素

## 使い方

1. 対応する入力フィールドで `:` を入力
2. 絵文字名を入力してフィルタリング（例：`:joy` → 😂）
3. 矢印キーで選択、Enterで確定
4. またはマウスでクリック

## 開発

```bash
# 依存関係をインストール
npm install

# ビルド
npm run build

# 開発モード（ファイル変更を監視）
npm run dev
```

## インストール

1. `npm run build` でビルド
2. Chrome拡張機能管理画面で「デベロッパーモード」を有効
3. 「パッケージ化されていない拡張機能を読み込む」で `dist` フォルダを選択

## デバッグ方法

### 1. 開発モードでビルド
```bash
npm run build:dev  # 開発用ビルド（デバッグ情報付き）
npm run debug      # ファイル変更を監視してリアルタイムビルド
```

### 2. Chrome DevToolsでのデバッグ
1. 任意のWebページでF12を押してDevToolsを開く
2. **Console**タブで `[EmojiPicker]` のログを確認
3. **Sources**タブで `content-script.js` を見つけてブレークポイント設定

### 3. 拡張機能固有のデバッグ
1. `chrome://extensions/` を開く
2. 対象の拡張機能で「詳細」をクリック
3. 「拡張機能のビューを検査」で背景ページを確認

### 4. よくある問題とデバッグ方法

**絵文字ピッカーが表示されない場合:**
```javascript
// Consoleで確認
console.log('[EmojiPicker] EmojiPickerExtension initializing...');
console.log('[EmojiPicker] Loaded X emojis');
```

**`:` 文字の検出がされない場合:**
```javascript
// Consoleで確認
console.log('[EmojiPicker] Colon detected with query: "..."');
```

**ファイル読み込みエラー:**
```javascript
// Consoleでエラー確認
// "Failed to load emoji data: ..." が表示される場合
```

### 5. 拡張機能のリロード
コードを変更した後は：
1. `npm run build:dev` でリビルド
2. Chrome拡張機能管理画面で「🔄」ボタンをクリック
3. 対象ページをリロード

### 6. よくあるエラーと解決方法

**CSP (Content Security Policy) エラー:**
```
Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source...
```
→ 解決済み：webpack.config.jsで`devtool: 'source-map'`を使用

**拡張機能が読み込まれない:**
- manifest.jsonの構文エラーをチェック
- 必要なファイルが全て`dist/`フォルダに存在するか確認

**絵文字データが読み込まれない:**
- Consoleで`Failed to load emoji data:`エラーをチェック
- `web_accessible_resources`の設定を確認
