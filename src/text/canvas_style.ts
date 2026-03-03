import { COLORS } from "../colors"

export class TextCanvasStyle {
    tileSize: number // For now, just square canvases
    fontSize: number
    color: string

    constructor(tileSize: number, fontSize: number, color: string) {
        this.tileSize = tileSize
        this.fontSize = fontSize
        this.color = color
    }

    styleHash() {
        return `${this.tileSize}|${this.fontSize}-${this.color}`
    }
}

export const TILE_SIZE = 64

export const DEFAULT_STYLE = new TextCanvasStyle(TILE_SIZE, TILE_SIZE, COLORS.TERMINAL_GREEN)