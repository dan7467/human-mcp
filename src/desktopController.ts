import fs from "fs";
import path from "path";
import Jimp from "jimp";
import robot from "robotjs";

robot.setMouseDelay(50);

export async function enter_text(text: string): Promise<void> {
  robot.typeString(text);
}

export async function single_click_mouse(x: number, y: number): Promise<void> {
  robot.moveMouse(x, y);
  robot.mouseClick("left");
}

export async function move_mouse(x: number, y: number): Promise<void> {
  robot.moveMouse(x, y);
}

export async function double_click_mouse(x: number, y: number): Promise<void> {
  robot.moveMouse(x, y);
  robot.mouseClick("left", true);
}

export async function right_click_mouse(x: number, y: number): Promise<void> {
  robot.moveMouse(x, y);
  robot.mouseClick("right");
}

interface QueryTemplate {
  pattern: RegExp;
  filename: string;
  region?: (screen: { width: number; height: number }) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const SEARCH_TEMPLATES: QueryTemplate[] = [
  {
    pattern: /chrome|google chrome/,
    filename: "google_chrome_on_start_bar.png",
    region: (screen) => ({
      x: 0,
      y: Math.max(0, screen.height - 160),
      width: screen.width,
      height: 160,
    }),
  },
  {
    pattern: /edge|microsoft edge/,
    filename: "ms_edge_on_start_bar.png",
    region: (screen) => ({
      x: 0,
      y: Math.max(0, screen.height - 160),
      width: screen.width,
      height: 160,
    }),
  },
  {
    pattern: /minimize/,
    filename: "minimize_window.png",
    region: (screen) => ({
      x: Math.max(0, screen.width - 450),
      y: 0,
      width: 450,
      height: Math.min(120, screen.height),
    }),
  },
  {
    pattern: /restore/,
    filename: "restore_window.png",
    region: (screen) => ({
      x: Math.max(0, screen.width - 450),
      y: 0,
      width: 450,
      height: Math.min(120, screen.height),
    }),
  },
];

const SCREEN_CAPTURE_STEP = 5;
const COLOR_TOLERANCE = 60;
const MAX_TEMPLATE_PIXELS = 64;

function rgbToHex(r: number, g: number, b: number): string {
  return [r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toLowerCase();
}

function normalizeColor(color: string): string {
  return color.replace(/^#/, "").toLowerCase();
}

function isColorClose(
  templateHex: string,
  screenHex: string,
  tolerance: number,
): boolean {
  const tr = parseInt(templateHex.slice(0, 2), 16);
  const tg = parseInt(templateHex.slice(2, 4), 16);
  const tb = parseInt(templateHex.slice(4, 6), 16);
  const sr = parseInt(screenHex.slice(0, 2), 16);
  const sg = parseInt(screenHex.slice(2, 4), 16);
  const sb = parseInt(screenHex.slice(4, 6), 16);

  return (
    Math.abs(tr - sr) <= tolerance &&
    Math.abs(tg - sg) <= tolerance &&
    Math.abs(tb - sb) <= tolerance
  );
}

async function getTemplateForQuery(query: string): Promise<{
  template: Jimp;
  region?: { x: number; y: number; width: number; height: number };
} | null> {
  const normalized = query.trim().toLowerCase();
  const match = SEARCH_TEMPLATES.find((entry) =>
    entry.pattern.test(normalized),
  );
  if (!match) {
    return null;
  }

  const templatePath = path.resolve(__dirname, "..", "assets", match.filename);
  if (!fs.existsSync(templatePath)) {
    return null;
  }

  const template = await Jimp.read(templatePath);
  const region = match.region?.(robot.getScreenSize());
  return { template, region };
}

async function findTemplatePosition(
  screen: any,
  template: Jimp,
): Promise<{ x: number; y: number } | null> {
  const templatePixels: Array<{ x: number; y: number; hex: string }> = [];
  const { width: tw, height: th } = template.bitmap;

  for (let ty = 0; ty < th; ty++) {
    for (let tx = 0; tx < tw; tx++) {
      const rgba = Jimp.intToRGBA(template.getPixelColor(tx, ty));
      if (rgba.a < 16) {
        continue;
      }
      templatePixels.push({
        x: tx,
        y: ty,
        hex: rgbToHex(rgba.r, rgba.g, rgba.b),
      });
    }
  }

  if (templatePixels.length === 0) {
    return null;
  }

  const sampleStep = Math.max(
    1,
    Math.ceil(templatePixels.length / MAX_TEMPLATE_PIXELS),
  );
  const candidatePixels = templatePixels.filter(
    (_, index) => index % sampleStep === 0,
  );

  const width = screen.width;
  const height = screen.height;

  for (let sy = 0; sy <= height - th; sy += SCREEN_CAPTURE_STEP) {
    for (let sx = 0; sx <= width - tw; sx += SCREEN_CAPTURE_STEP) {
      let matched = true;

      for (const pixel of candidatePixels) {
        const screenHex = normalizeColor(
          screen.colorAt(sx + pixel.x, sy + pixel.y),
        );
        if (!isColorClose(pixel.hex, screenHex, COLOR_TOLERANCE)) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return { x: sx + Math.floor(tw / 2), y: sy + Math.floor(th / 2) };
      }
    }
  }

  return null;
}

export async function search_point_or_area_on_screen(
  query: string,
): Promise<{ x: number; y: number } | null> {
  const queryTemplate = await getTemplateForQuery(query);
  if (!queryTemplate) {
    return null;
  }

  const screenSize = robot.getScreenSize();
  const region = queryTemplate.region ?? {
    x: 0,
    y: 0,
    width: screenSize.width,
    height: screenSize.height,
  };

  const screen = robot.screen.capture(
    region.x,
    region.y,
    region.width,
    region.height,
  );

  const found = await findTemplatePosition(screen, queryTemplate.template);
  if (!found) {
    return null;
  }

  return { x: region.x + found.x, y: region.y + found.y };
}
