import { Container, BitmapText } from "pixi.js"
import { GameApp } from "./app"
import { COLORS } from "./colors"

const BUFFER_LENGTH = 120

export class DebugOverlay extends Container {
    app: GameApp
    text: BitmapText

    FPS: number
    resolution: string
    load: number

    frameBuffer: number[]
    workBuffer: number[]

    zoom: number

    constructor(app: GameApp) {
        super()
        this.app = app

        this.frameBuffer = []
        this.workBuffer = []

        this.FPS = NaN
        this.resolution = "?x?"
        this.load = NaN
        this.zoom = 1

        this.text = new BitmapText({
            text: "",
            style: {
                align: "right",
                fontFamily: "monospace",
                fill: COLORS.TERMINAL_GREEN,
                fontSize: 24
            }
        })

        this.text.anchor.set(1, 0)
        this.text.position.set(-5, 5)
        this.addChild(this.text)
    }

    pushFrame(duration: number) {
        this.frameBuffer.push(duration)
        if (this.frameBuffer.length > BUFFER_LENGTH) this.frameBuffer.shift()
    }

    pushWork(duration: number) {
        this.workBuffer.push(duration)
        if (this.workBuffer.length > BUFFER_LENGTH) this.workBuffer.shift()
    }

    setZoom(zoom: number) {
        this.zoom = zoom
    }

    updateResolution() {
        this.resolution = `${this.app.width}x${this.app.height}`
        this.text.position.set(this.app.width - 5, 5)
    }

    update(deltaMS: number) {
        this.pushFrame(deltaMS)

        const totalTime = this.frameBuffer.reduce((sum, val) => sum + val, 0)
        const totalWork = this.workBuffer.reduce((sum, val) => sum + val, 0)

        this.FPS = (totalTime !== 0) ? 1000 * this.frameBuffer.length / totalTime : NaN
        this.load = (totalTime !== 0) ? 100 * totalWork / totalTime : NaN

        const topLine = `${this.FPS.toFixed(2)}@${this.resolution} (${this.load.toFixed(2)}%)`
        const zoomLine = `Zoom: ${(this.zoom * 100).toFixed(2)}%`

        this.text.text = [topLine, zoomLine].join("\n")
    }
}