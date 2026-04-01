import { Container, Graphics } from "pixi.js"
import { TILE_SIZE } from "../text/canvas_style"
import { VisibilityManager } from "./visibility_manager"
import { COLORS } from "../colors"
import { TileVisibility } from "./tile_visibility"

export class VisibilitydGrid extends Container {
    rows: number
    cols: number

    visibilityTiles: Graphics[]

    constructor(rows: number, cols: number) {
        super()
        this.rows = rows
        this.cols = cols

        this.visibilityTiles = Array.from({length: this.rows * this.cols}, () => new Graphics())
        this.visibilityTiles.forEach((tile, index) => {
            const col = index % this.cols
            const row = (index - col) / this.cols
            tile.position.set(col * TILE_SIZE, row * TILE_SIZE)
            this.addChild(tile)
        })
    }

    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    setTile(row: number, col: number, visibility: TileVisibility) {
        const tile = this.visibilityTiles[row * this.cols + col]
        if (visibility === TileVisibility.VISIBLE) {
            tile.visible = false
        } else {
            tile.visible = true
            tile.clear()
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(COLORS.TERMINAL_BLACK)
            if (visibility === TileVisibility.HIDDEN) {
                tile.alpha = 0.5
            } else {
                tile.alpha = 1
            }
        }
    }

    draw(visibility: VisibilityManager) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.setTile(row, col, visibility.getVisibility(row, col))
            }
        }
    }
}