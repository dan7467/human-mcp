# human-mcp

An MCP for desktop automation built in TypeScript, aimmed to replace anything a human can do (move mouse, input text, find things on screen...)
Once the MCP is running, an agent can call the HTTP endpoints to control the machine.

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

# Kanban board:

## Backlog

- `TASK-5`: improve search_point_or_area_on_screen tool to not depend on static images from "assets" dir (maybe search on web?)
- `TASK-6`: cover with unit tests to 100% (create package.json script), and create a Github Action to run the unit tests script after every commit
- `TASK-7`: find a way to connect the MCP to a Whatsapp bot, such that I can perform stuff on my computer from far away
- `TASK-8`: add a flag for OS type, and add support to Windows 11 (might not require changes), Mac, Linux

## In progress

- `TASK-2`: test integration to VS Code's "mcp.json" 
- `TASK-3`: create a prompt which will test basic functionality, to pose as regression tests
- `TASK-4`: continue testing search_point_or_area_on_screen tool

## Done

- `TASK-1`: implement basic MCP which can move on screen
