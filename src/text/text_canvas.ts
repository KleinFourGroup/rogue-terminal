import { TextCanvasStyle } from "./canvas_style"

export class TextCanvas {
    style: TextCanvasStyle
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    constructor(style: TextCanvasStyle) {
        this.style = style
        this.canvas = document.createElement("canvas")
        this.canvas.width = this.style.tileSize
        this.canvas.height = this.style.tileSize
        this.ctx = this.canvas.getContext("2d")!

        // set style
        this.ctx.fillStyle = this.style.color
        this.ctx.font = `${this.style.fontSize}px monospace`
        this.ctx.textBaseline = "middle"
        this.ctx.textAlign = "center"
    }

    writeText(text: string) {
        this.ctx.clearRect(0, 0, this.style.tileSize, this.style.tileSize)
        this.ctx.fillText(text, this.style.tileSize / 2, this.style.tileSize / 2)
    }
}