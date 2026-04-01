import { SignalEmitter } from "../signal"
import { IEntitySprite } from "../text/entity_sprite"
import { TileVisibility, TileVisibilitySignals, VISIBILITIES } from "./tile_visibility"

export abstract class VisibilityEmitter {
    rows: number
    cols: number

    visibilityArray: TileVisibility[]
    visibilitySets: Record<TileVisibility, Set<number>>
    visibilityCaches: Record<TileVisibility, Set<number>>
        
    signals: TileVisibilitySignals

    constructor(rows: number, cols: number, visibilityArray: TileVisibility[], visibilitySets: Record<TileVisibility, Set<number>>) {
        this.rows = rows
        this.cols = cols

        this.visibilityArray = visibilityArray
        
        this.visibilitySets = visibilitySets
        
        this.visibilityCaches = {
            [TileVisibility.UNEXPLORED]: new Set<number>(),
            [TileVisibility.HIDDEN]: new Set<number>(),
            [TileVisibility.VISIBLE]: new Set<number>()
        }
        
        this.signals = {
            [TileVisibility.UNEXPLORED]: new SignalEmitter<Set<number>>(),
            [TileVisibility.HIDDEN]: new SignalEmitter<Set<number>>(),
            [TileVisibility.VISIBLE]: new SignalEmitter<Set<number>>()
        }
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

    emitDifferences() {
        for (const visibility of VISIBILITIES) {
            this.signals[visibility].emit(this.visibilitySets[visibility].difference(this.visibilityCaches[visibility]))
        }
    }
}