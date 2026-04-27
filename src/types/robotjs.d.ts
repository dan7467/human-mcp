declare module "robotjs" {
  interface Point {
    x: number;
    y: number;
  }

  function setMouseDelay(delay: number): void;
  function typeString(text: string): void;
  function moveMouse(x: number, y: number): void;
  function mouseClick(button?: string, double?: boolean): void;
  function getScreenSize(): { width: number; height: number };

  interface Bitmap {
    width: number;
    height: number;
    image: string;
    byteWidth: number;
    bitsPerPixel: number;
    bytesPerPixel: number;
    colorAt(x: number, y: number): string;
  }

  interface ScreenModule {
    capture(x: number, y: number, width: number, height: number): Bitmap;
  }

  const _default: {
    setMouseDelay(delay: number): void;
    typeString(text: string): void;
    moveMouse(x: number, y: number): void;
    mouseClick(button?: string, double?: boolean): void;
    getScreenSize(): { width: number; height: number };
    screen: ScreenModule;
  };

  export default _default;
}
