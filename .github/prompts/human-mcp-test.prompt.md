---
name: human-mcp-test
description: Describe when to use this prompt
---

I want to test the functionality of the human-mcp project by invoking its tools and verifying their behavior. I will use the MCP server's HTTP endpoints to send requests to the tools and check their responses. This will help ensure that the desktop automation features are working correctly on Windows 10.

First - start the MCP server by running `npm start` in the terminal. Then, I will use the `curl` command to invoke different tools such as `enter_text`, `single_click_mouse`, and `search_on_screen`. For example, I can test the mouse click tool by sending a POST request to the `/invoke` endpoint with the appropriate JSON payload.

Test 1: Right click on coordinates (20, 20), and then left click on coordinates (36, 36).

Test 2: Search for the "Docker Desktop icon" on the screen (hint: on the bottom "Start" bar), when found - write here the coordinates of the icon for me to verify, and lastly: right-click on it.
