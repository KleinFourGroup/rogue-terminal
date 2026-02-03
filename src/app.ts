import { Application } from "pixi.js"
import { Scene } from "./scene"
import * as COLORS from "./colors"
import { TextSprite } from "./text_sprite"
import { GameScene } from "./game"

export class GameApp extends Application {
    faviconCanvas: HTMLCanvasElement
    faviconCtx: CanvasRenderingContext2D

    mainScene: Scene | null

    constructor() {
        super()
        
        this.faviconCanvas = document.createElement("canvas")
        this.faviconCanvas.width = 16
        this.faviconCanvas.height = 16

        this.faviconCtx = this.faviconCanvas.getContext("2d")!

        this.mainScene = null
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

    setScene(scene: Scene) {
        if (scene.app !== this) throw new Error("Scene has incorrect app!") // Should never happen

        // Remove the old scene
        if (this.mainScene !== null) this.stage.removeChild(this.mainScene)

        this.mainScene = scene
        this.stage.addChild(this.mainScene)
    }

    async startApp() {
        await this.initPixi()

        this.drawFavicon()        

        const game = new GameScene(this)
        this.setScene(game)

        // Listen for animate update
        this.ticker.add((ticker) => {
            this.mainScene!.update(ticker.deltaMS)
        });
    }
}