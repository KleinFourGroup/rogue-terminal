import { Application, Container } from "pixi.js"
import { Scene } from "./scene"
import { COLORS } from "./colors"
import { GameScene } from "./game"
import { DebugOverlay } from "./debug_overlay"

export class GameApp extends Application {
    width: number
    height: number

    faviconCanvas: HTMLCanvasElement
    faviconCtx: CanvasRenderingContext2D

    debugOverlay: DebugOverlay
    sceneStage: Container

    mainScene: Scene | null

    constructor() {
        super()

        this.width = -1
        this.height = -1

        this.faviconCanvas = document.createElement("canvas")
        this.faviconCanvas.width = 16
        this.faviconCanvas.height = 16

        this.faviconCtx = this.faviconCanvas.getContext("2d")!

        this.debugOverlay = new DebugOverlay(this)
        this.sceneStage = new Container()

        this.stage.addChild(this.sceneStage)
        this.stage.addChild(this.debugOverlay)

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
        if (this.mainScene !== null) this.sceneStage.removeChild(this.mainScene)

        this.mainScene = scene
        this.sceneStage.addChild(this.mainScene)
    }

    updateResolution() {
        this.width = this.screen.width
        this.height = this.screen.height
        this.debugOverlay.updateResolution()
        this.mainScene?.updateResolution()
    }

    update(deltaMS: number) {
        let updateResolution = (this.width !== this.renderer.width || this.height !== this.renderer.height)
        if (updateResolution) this.updateResolution()

        this.mainScene!.update(deltaMS)
    }

    async startApp() {
        await this.initPixi()

        this.drawFavicon()        

        const game = new GameScene(this)
        this.setScene(game)

        this.updateResolution()

        // Listen for animate update
        this.ticker.add((ticker) => {
            this.update(ticker.deltaMS)
        });
    }
}