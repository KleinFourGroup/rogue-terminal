import { Graphics } from "pixi.js"
import { TILE_SIZE } from "../text/canvas_style"
import { COLORS } from "../colors"
import { TileVisibility, VISIBILITIES } from "./tile_visibility"
import { VisibilityEmitter } from "./visibility_emitter"
import { VisibilityManager } from "./visibility_manager"

export class VisibilityDisplay extends VisibilityEmitter{
    visibilityManager: VisibilityManager

    visibilityMasks: Record<TileVisibility, Graphics>
    
    constructor(visibilityManager: VisibilityManager) {
        const visibilityArray = [...visibilityManager.visibilityArray]
        
        const visibilitySets = {
            [TileVisibility.UNEXPLORED]: new Set<number>(visibilityManager.visibilitySets[TileVisibility.UNEXPLORED]),
            [TileVisibility.HIDDEN]: new Set<number>(visibilityManager.visibilitySets[TileVisibility.HIDDEN]),
            [TileVisibility.VISIBLE]: new Set<number>(visibilityManager.visibilitySets[TileVisibility.VISIBLE])
        }
        
        super(visibilityManager.rows, visibilityManager.cols, visibilityArray, visibilitySets)

        this.visibilityManager = visibilityManager

        this.visibilityMasks = {
            [TileVisibility.UNEXPLORED]: new Graphics(),
            [TileVisibility.HIDDEN]: new Graphics(),
            [TileVisibility.VISIBLE]: new Graphics()
        }
    }

    updateVisibility() {
        this.visibilityArray = [...this.visibilityManager.visibilityArray]
        
        this.visibilitySets = {
            [TileVisibility.UNEXPLORED]: new Set<number>(this.visibilityManager.visibilitySets[TileVisibility.UNEXPLORED]),
            [TileVisibility.HIDDEN]: new Set<number>(this.visibilityManager.visibilitySets[TileVisibility.HIDDEN]),
            [TileVisibility.VISIBLE]: new Set<number>(this.visibilityManager.visibilitySets[TileVisibility.VISIBLE])
        }
    }

    clearVisibleMask() {
        this.visibilityMasks[TileVisibility.VISIBLE].clear()
    }

    drawMasks() {
        for (const visibility of VISIBILITIES) {
            this.visibilityMasks[visibility].clear()
            for (const index of this.visibilitySets[visibility]) {
                const col = index % this.cols
                const row = (index - col) / this.cols
                this.visibilityMasks[visibility].rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(COLORS.TERMINAL_BLACK)
            }
        }
    }
}