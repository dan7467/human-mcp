# human-mcp

A Windows 10-focused MCP for desktop automation built in TypeScript.

## What this project includes

- `enter_text(text)` - types text using the system keyboard
- `single_click_mouse(x, y)` - moves the mouse and performs a left-click
- `move_mouse(x, y)` - moves the mouse cursor
- `double_click_mouse(x, y)` - performs a double left-click
- `right_click_mouse(x, y)` - performs a right-click
- `search_point_or_area_on_screen(query)` - searches the screen for a target template image and returns a click point

### Notes on search

The `search_point_or_area_on_screen` tool uses local image templates from `assets/` to find a matching screen region. For example, a query like "Google Chrome icon" will match a template file such as `assets/chrome.png` when the mapping is configured in the MCP.

## How this is an MCP

This project is built as a local MCP server, not just a library.
It exposes tool metadata and invocation endpoints over HTTP so agent systems can discover available tools and request actions.

## Setup

1. Install Node.js 18+ on Windows.
2. Open this folder in VS Code.
3. Open a terminal and run:

```bash
npm install
```

4. Build the TypeScript project:

```bash
npm run build
```

5. Start the MCP server:

```bash
npm start
```

The server listens by default on `http://localhost:4070`.

## Using the MCP server

- `GET /tools` returns the available tool definitions.
- `GET /manifest` returns the MCP manifest.
- `POST /invoke` invokes a tool.

Example:

```bash
curl -X POST http://localhost:4070/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool":"single_click_mouse","args":{"x":100,"y":100}}'
```

Example for typing text:

```bash
curl -X POST http://localhost:4070/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool":"enter_text","args":{"text":"thanks!"}}'
```

## Testing the MCP

1. Run `npm run build`.
2. Run `npm start`.
3. Use `curl` or another HTTP client to invoke tools.

## Notes

- This initial version implements the two most straightforward tools: `enter_text` and `single_click_mouse`.
- The server also exposes other desktop tool entrypoints, with `search_point_or_area_on_screen` currently a placeholder.
- Once the MCP is running, an agent can call the HTTP endpoints to control the machine.
