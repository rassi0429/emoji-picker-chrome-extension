# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Extension project for a Discord-style emoji picker that triggers on `:` character input. The project is currently in early development stage with detailed specifications but minimal implementation.

## Key Project Details

- **Target Platform**: Chrome Extension using Manifest V3
- **Core Functionality**: Emoji picker triggered by `:` character in input fields (`<input>`, `<textarea>`, `contenteditable`)
- **UI Pattern**: Popup picker with real-time filtering and keyboard navigation
- **Data Source**: Local JSON file with emoji name/character mappings
- **Specification**: See `spec.md` for detailed Japanese requirements

## Development Status

**Current State**: Project is in planning phase with no build system or source code yet.

**Essential Setup Needed**:
1. `package.json` with Chrome extension development dependencies
2. `manifest.json` (Manifest V3 format)
3. Build system (Webpack/Rollup/Vite recommended)
4. TypeScript configuration
5. Testing framework

## Recommended Project Structure

```
├── src/
│   ├── content-script/     # Injected into web pages for emoji detection
│   ├── popup/             # Extension popup UI
│   ├── background/        # Service worker
│   ├── data/             # Emoji data files
│   └── styles/           # CSS/SCSS files
├── dist/                 # Build output
├── tests/               # Test files
├── manifest.json        # Chrome extension manifest
└── package.json         # Dependencies and scripts
```

## Implementation Priority

1. Basic Chrome extension structure with manifest
2. Content script for detecting `:` character in input fields
3. Emoji data management and search functionality
4. UI components for picker display
5. Event handling for keyboard/mouse interactions
6. Text replacement functionality

## Testing Strategy

- Unit tests for emoji search and filtering logic
- Integration tests for content script injection
- Manual testing in Chrome with different input field types
- Performance testing for DOM monitoring efficiency

## Performance Considerations

- Minimize DOM monitoring overhead
- Efficient emoji search algorithms
- Lazy loading of emoji data
- Memory management for content script lifecycle