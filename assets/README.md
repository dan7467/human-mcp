# Asset Templates for search_point_or_area_on_screen

This folder stores template PNG images used by the `search_point_or_area_on_screen` tool.

The MCP matches natural language queries against the templates defined in `src/desktopController.ts`.

Example mapping:

- `chrome.png` for queries like "Google Chrome icon"
- `word.png` for queries like "Microsoft Word icon"
- `mail.png` for queries like "mail icon"
- `window-button.png` for queries like "minimize" or "close"

To add a new query target:

1. Put a PNG file in this folder.
2. Add a new entry in the `SEARCH_TEMPLATES` array in `src/desktopController.ts`.
