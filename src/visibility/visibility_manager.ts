import { Graphics } from "pixi.js"
import { Entity } from "../entity"
import { TILE_SIZE } from "../text/canvas_style"
import { COLORS } from "../colors"
import { Observer } from "./observer"
import { TileVisibility, VISIBILITIES } from "./tile_visibility"
import { VisibilityEmitter } from "./visibility_emitter"

export class VisibilityManager extends VisibilityEmitter{
    visibilityMasks: Record<TileVisibility, Graphics>
    
    visibilityDrawn: TileVisibility[]
    
    constructor(rows: number, cols: number) {
        const visibilityArray = new Array<TileVisibility>(rows * cols).fill(TileVisibility.UNEXPLORED)
        
        const visibilitySets = {
            [TileVisibility.UNEXPLORED]: new Set<number>(),
            [TileVisibility.HIDDEN]: new Set<number>(),
            [TileVisibility.VISIBLE]: new Set<number>()
        }
        
        super(rows, cols, visibilityArray, visibilitySets)

        this.visibilityMasks = {
            [TileVisibility.UNEXPLORED]: new Graphics(),
            [TileVisibility.HIDDEN]: new Graphics(),
            [TileVisibility.VISIBLE]: new Graphics()
        }

        this.visibilityDrawn = this.visibilityArray

        this.flood(TileVisibility.UNEXPLORED)
    }

    flood(visibility: TileVisibility) {
        for (let index = 0; index < this.rows * this.cols; index++) {
            this.visibilitySets[visibility].add(index)
        }
    }

    setVisibility(row: number, col: number, visibility: TileVisibility) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            const oldVisibility = this.visibilityArray[index]
            this.visibilityArray[index] = visibility
            if (visibility !== oldVisibility) {
                this.visibilitySets[oldVisibility].delete(index)
            }
            this.visibilitySets[visibility].add(index)
        }
    }

    clearVisibilitySets() {
        for (const visibility of VISIBILITIES) {
            this.visibilitySets[visibility].clear()
        }
    }

    cacheDrawnArray() {
        this.visibilityDrawn = [...this.visibilityArray]
    }

    updateDrawnArray() {
        this.visibilityDrawn = this.visibilityArray
    }

    resetAll() {
        this.cacheVisibilitySets()
        this.clearVisibilitySets()
        this.visibilityArray.fill(TileVisibility.UNEXPLORED)
        this.flood(TileVisibility.UNEXPLORED)
        this.visibilityMasks[TileVisibility.VISIBLE].clear()
    }

    reset() {
        this.cacheVisibilitySets()
        for (const index of this.visibilitySets[TileVisibility.VISIBLE]) {
            this.visibilityArray[index] = TileVisibility.HIDDEN
            this.visibilitySets[TileVisibility.HIDDEN].add(index)
        }
        this.visibilitySets[TileVisibility.VISIBLE].clear()
        // this.clearVisibleMask()
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

    calculateFOV(entity: Entity) {
        const observer = entity.getComponent(Observer)!
        for (let row = entity.row - observer.viewDistance; row < entity.row + entity.height + observer.viewDistance; row++) {
            for (let col = entity.col - observer.viewDistance; col < entity.col + entity.width + observer.viewDistance; col++) {
                this.setVisibility(row, col, TileVisibility.VISIBLE)
            }
        }
    }
}