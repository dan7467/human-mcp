import http from "http";
import {
  enter_text,
  single_click_mouse,
  move_mouse,
  double_click_mouse,
  right_click_mouse,
  search_on_screen,
} from "./desktopController";

export interface MCPTool {
  name: string;
  description: string;
  inputs: Record<string, string>;
}

const tools: MCPTool[] = [
  {
    name: "enter_text",
    description: "Type text using the system keyboard.",
    inputs: { text: "string" },
  },
  {
    name: "single_click_mouse",
    description:
      "Move the mouse to a screen coordinate and perform a left click.",
    inputs: { x: "number", y: "number" },
  },
  {
    name: "move_mouse",
    description: "Move the mouse to a screen coordinate.",
    inputs: { x: "number", y: "number" },
  },
  {
    name: "double_click_mouse",
    description: "Move the mouse and perform a double left click.",
    inputs: { x: "number", y: "number" },
  },
  {
    name: "right_click_mouse",
    description: "Move the mouse and perform a right click.",
    inputs: { x: "number", y: "number" },
  },
  {
    name: "search_on_screen",
    description:
      "Search the screen for an image or area. Placeholder implementation.",
    inputs: { query: "string" },
  },
];

export async function invokeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (toolName) {
    case "enter_text":
      return enter_text(String(args.text ?? ""));
    case "single_click_mouse":
      return single_click_mouse(Number(args.x), Number(args.y));
    case "move_mouse":
      return move_mouse(Number(args.x), Number(args.y));
    case "double_click_mouse":
      return double_click_mouse(Number(args.x), Number(args.y));
    case "right_click_mouse":
      return right_click_mouse(Number(args.x), Number(args.y));
    case "search_on_screen":
      return search_on_screen(String(args.query ?? ""));
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

function respondJson(
  res: http.ServerResponse,
  statusCode: number,
  body: unknown,
) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(payload);
}

function parseBody(
  req: http.IncomingMessage,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        resolve(body);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export async function startMcpServer(port = 4070): Promise<http.Server> {
  const server = http.createServer(async (req, res) => {
    const url = req.url ?? "";
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && url === "/tools") {
      respondJson(res, 200, { tools });
      return;
    }

    if (req.method === "GET" && url === "/manifest") {
      respondJson(res, 200, {
        name: "human-mcp",
        description: "Local Windows MCP for desktop automation tools.",
        version: "0.1.0",
        tools,
      });
      return;
    }

    if (req.method === "POST" && url === "/invoke") {
      try {
        const body = await parseBody(req);
        const toolName = String(body.tool ?? "");
        const args = (body.args ?? {}) as Record<string, unknown>;
        const result = await invokeTool(toolName, args);
        respondJson(res, 200, { tool: toolName, result });
      } catch (error) {
        respondJson(res, 400, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return;
    }

    respondJson(res, 404, { error: "Unknown endpoint" });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`human-mcp server listening on http://localhost:${port}`);
      resolve(server);
    });
    server.on("error", reject);
  });
}

if (require.main === module) {
  startMcpServer().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start human-mcp server:", error);
    process.exit(1);
  });
}
