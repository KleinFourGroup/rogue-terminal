import { Entity } from "../entity"
import { Observer } from "./observer"
import { TileVisibility, VISIBILITIES } from "./tile_visibility"
import { VisibilityEmitter } from "./visibility_emitter"

export class VisibilityManager extends VisibilityEmitter{
    constructor(rows: number, cols: number) {
        const visibilityArray = new Array<TileVisibility>(rows * cols).fill(TileVisibility.UNEXPLORED)
        
        const visibilitySets = {
            [TileVisibility.UNEXPLORED]: new Set<number>(),
            [TileVisibility.HIDDEN]: new Set<number>(),
            [TileVisibility.VISIBLE]: new Set<number>()
        }
        
        super(rows, cols, visibilityArray, visibilitySets)

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

    resetAll() {
        this.cacheVisibilitySets()
        this.clearVisibilitySets()
        this.visibilityArray.fill(TileVisibility.UNEXPLORED)
        this.flood(TileVisibility.UNEXPLORED)
    }

    reset() {
        this.cacheVisibilitySets()
        for (const index of this.visibilitySets[TileVisibility.VISIBLE]) {
            this.visibilityArray[index] = TileVisibility.HIDDEN
            this.visibilitySets[TileVisibility.HIDDEN].add(index)
        }
        this.visibilitySets[TileVisibility.VISIBLE].clear()
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