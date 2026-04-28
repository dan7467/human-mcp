// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";
import Jimp from "jimp";
import robot from "robotjs";
import { createWorker } from "tesseract.js";

// robot.setMouseDelay(50);

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

async function search_on_screen(
  query: string,
): Promise<{ x: number; y: number } | null> {
  const worker = await createWorker("eng");
  try {
    const screenSize = robot.getScreenSize();
    const screen = robot.screen.capture(
      0,
      0,
      screenSize.width,
      screenSize.height,
    );

    // Create Jimp image from screen capture
    const image = new Jimp(screenSize.width, screenSize.height);
    for (let y = 0; y < screenSize.height; y++) {
      for (let x = 0; x < screenSize.width; x++) {
        const color = screen.colorAt(x, y);
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        image.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
      }
    }

    const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const {
      data: { words },
    } = await worker.recognize(imageBuffer);

    // Find word that matches the query
    const normalizedQuery = query.toLowerCase();
    for (const word of words) {
      if (
        word.text.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(word.text.toLowerCase())
      ) {
        const centerX = word.bbox.x0 + (word.bbox.x1 - word.bbox.x0) / 2;
        const centerY = word.bbox.y0 + (word.bbox.y1 - word.bbox.y0) / 2;
        return { x: Math.round(centerX), y: Math.round(centerY) };
      }
    }

    return null;
  } finally {
    await worker.terminate();
  }
}
