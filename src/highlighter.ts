import { Graphics } from "pixi.js"
import { TilePosition } from "./position"
import { TILE_SIZE } from "./text/canvas_style"
import { COLORS } from "./colors"

type HighlightTarget = TilePosition | null

function drawRoundedBox(graphics: Graphics, color: string) {
    const STROKE_WIDTH = 5
    return graphics.roundRect(STROKE_WIDTH / 2, STROKE_WIDTH / 2, TILE_SIZE - STROKE_WIDTH, TILE_SIZE - STROKE_WIDTH, TILE_SIZE / 4).stroke({ width: STROKE_WIDTH, color: color })
}

export class HighlighterDisplay {
    target: HighlightTarget
    highlight: Graphics

    constructor() {
        this.target = null
        this.highlight = new Graphics()
        drawRoundedBox(this.highlight, COLORS.TERMINAL_GREEN)
        this.highlight.visible = false
    }

    setTarget(target: HighlightTarget) {
        if (target === null) {
            this.highlight.visible = false
        } else if (target !== null) {
            this.highlight.position.set(target.col * TILE_SIZE, target.row * TILE_SIZE)
            this.highlight.visible = true
        }

        this.target = target
    }
}