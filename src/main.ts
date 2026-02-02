import { Application, Assets, Sprite, Texture } from "pixi.js"
import * as COLORS from "./colors"

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: COLORS.TERMINAL_BLACK, resizeTo: window });

  const faviconCanvas = document.createElement("canvas")
  faviconCanvas.width = 16
  faviconCanvas.height = 16

  const faviconCtx = faviconCanvas.getContext("2d")!
  // if (faviconCtx !== null) {
    faviconCtx.fillStyle = COLORS.TERMINAL_BLACK
    faviconCtx.fillRect(0, 0, 16, 16)

    faviconCtx.fillStyle = COLORS.TERMINAL_GREEN
    faviconCtx.font = "16px serif"
    faviconCtx.textBaseline = "middle"
    faviconCtx.textAlign = "center"
    faviconCtx.fillText("@", 8, 8)

    document.getElementById("favicon")!.setAttribute("href", faviconCanvas.toDataURL())

  // }

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Load the bunny texture
  // const texture = await Assets.load("/assets/bunny.png");

  const textureCanvas = document.createElement("canvas")
  textureCanvas.width = 64
  textureCanvas.height = 64
  const textureCtx = textureCanvas.getContext("2d")!

  textureCtx.clearRect(0, 0, 64, 64)
  textureCtx.fillStyle = COLORS.TERMINAL_GREEN
  textureCtx.font = "64px serif"
  textureCtx.textBaseline = "middle"
  textureCtx.textAlign = "center"
  textureCtx.fillText("@", 32, 32)

  // Create a bunny Sprite
  const bunny = new Sprite(Texture.from(textureCanvas));

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;
  });
})();
