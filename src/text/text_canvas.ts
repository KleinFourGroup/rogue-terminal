import { COLORS } from "../colors"

export class TextCanvas {
    size: number // For now, just square canvases
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    color: string

    constructor(size: number, color: string = COLORS.TERMINAL_GREEN) {
        this.size = size
        this.canvas = document.createElement("canvas")
        this.canvas.width = this.size
        this.canvas.height = this.size
        this.ctx = this.canvas.getContext("2d")!

        this.color = color

        // Style, 
        this.ctx.fillStyle = this.color
        this.ctx.font = `${this.size}px monospace`
        this.ctx.textBaseline = "middle"
        this.ctx.textAlign = "center"
    }

    writeText(text: string) {
        this.ctx.clearRect(0, 0, this.size, this.size)
        this.ctx.fillText(text, this.size / 2, this.size / 2)
    }

    getStringHash() {
        return `${this.size}|${this.color}`
    }
}