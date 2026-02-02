import { Application } from "pixi.js"
import * as COLORS from "./colors"
import { TextSprite } from "./text_sprite"

export class GameApp extends Application {
    faviconCanvas: HTMLCanvasElement
    faviconCtx: CanvasRenderingContext2D

    constructor() {
        super()
        
        this.faviconCanvas = document.createElement("canvas")
        this.faviconCanvas.width = 16
        this.faviconCanvas.height = 16

        this.faviconCtx = this.faviconCanvas.getContext("2d")!
    }

    async initPixi() {
        // Initialize the application
        await this.init({ background: COLORS.TERMINAL_BLACK, resizeTo: window })
        // Append the application canvas to the document body
        document.getElementById("pixi-container")!.appendChild(this.canvas)
    }

    drawFavicon() {
        this.faviconCtx.fillStyle = COLORS.TERMINAL_BLACK
        this.faviconCtx.fillRect(0, 0, 16, 16)

        this.faviconCtx.fillStyle = COLORS.TERMINAL_GREEN
        this.faviconCtx.font = "16px serif"
        this.faviconCtx.textBaseline = "middle"
        this.faviconCtx.textAlign = "center"
        this.faviconCtx.fillText("@", 8, 8)

        document.getElementById("favicon")!.setAttribute("href", this.faviconCanvas.toDataURL())
    }

    async run() {
        await this.initPixi()

        this.drawFavicon()        

        // Create a userSprite Sprite
        const userSprite = new TextSprite("@")

        // Center the sprite's anchor point
        userSprite.anchor.set(0.5);

        // Move the sprite to the center of the screen
        userSprite.position.set(this.screen.width / 2, this.screen.height / 2);

        // Add the userSprite to the stage
        this.stage.addChild(userSprite);

        // Listen for animate update
        this.ticker.add((ticker) => {
            // Just for fun, let's rotate mr rabbit a little.
            // * Delta is 1 if running at 100% performance *
            // * Creates frame-independent transformation *
            userSprite.rotation += 0.1 * ticker.deltaTime;
        });
    }
}