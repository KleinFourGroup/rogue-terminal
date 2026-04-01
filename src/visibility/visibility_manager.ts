import { Graphics } from "pixi.js"
import { Entity } from "../entity"
import { TILE_SIZE } from "../text/canvas_style"
import { COLORS } from "../colors"
import { SignalEmitter } from "../signal"
import { Observer } from "./observer"
import { IEntitySprite } from "../text/entity_sprite"
import { TileVisibility, TileVisibilitySignals, VISIBILITIES } from "./tile_visibility"

export class VisibilityManager {
    rows: number
    cols: number

    visibilityArray: TileVisibility[]
    visibilitySets: Record<TileVisibility, Set<number>>
    visibilityCaches: Record<TileVisibility, Set<number>>

    visibilityMasks: Record<TileVisibility, Graphics>
    
    visibilityDrawn: TileVisibility[]
    
    signals: TileVisibilitySignals

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols

        this.visibilityArray = new Array<TileVisibility>(this.rows * this.cols).fill(TileVisibility.UNEXPLORED)
        
        this.visibilitySets = {
            [TileVisibility.UNEXPLORED]: new Set<number>(),
            [TileVisibility.HIDDEN]: new Set<number>(),
            [TileVisibility.VISIBLE]: new Set<number>()
        }
        this.visibilityCaches = {
            [TileVisibility.UNEXPLORED]: new Set<number>(),
            [TileVisibility.HIDDEN]: new Set<number>(),
            [TileVisibility.VISIBLE]: new Set<number>()
        }

        this.visibilityMasks = {
            [TileVisibility.UNEXPLORED]: new Graphics(),
            [TileVisibility.HIDDEN]: new Graphics(),
            [TileVisibility.VISIBLE]: new Graphics()
        }

        this.visibilityDrawn = this.visibilityArray
        
        this.signals = {
            [TileVisibility.UNEXPLORED]: new SignalEmitter<Set<number>>(),
            [TileVisibility.HIDDEN]: new SignalEmitter<Set<number>>(),
            [TileVisibility.VISIBLE]: new SignalEmitter<Set<number>>()
        }

        this.flood(TileVisibility.UNEXPLORED)
    }

    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    getVisibility(row: number, col: number) {
        if (this.isInBounds(row, col)) {
            return this.visibilityArray[row * this.cols + col]
        }

        return TileVisibility.UNEXPLORED
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

    isEntityVisible(entity: IEntitySprite) {
        for (let row = entity.row; row < entity.row + entity.height; row++) {
            for (let col = entity.col; col < entity.col + entity.width; col++) {
                if (this.isInBounds(row, col) && this.visibilityArray[row * this.cols + col] === TileVisibility.VISIBLE) {
                    return true
                }
            }
        }

        return false
    }

    cacheVisibilitySets() {
        for (const visibility of VISIBILITIES) {
            this.visibilityCaches[visibility] = new Set<number>(this.visibilitySets[visibility])
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

    emitDifferences() {
        for (const visibility of VISIBILITIES) {
            this.signals[visibility].emit(this.visibilitySets[visibility].difference(this.visibilityCaches[visibility]))
        }
    }
}