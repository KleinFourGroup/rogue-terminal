import { Entity } from "../entity"

const FOV_DISTANCE = 5

export enum TileVisibility {
    UNEXPLORED,
    HIDDEN,
    VISIBLE
}

export class VisibilityGrid {
    rows: number
    cols: number

    visibilityArray: TileVisibility[]
    visibleSet: Set<number>

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols

        this.visibilityArray = new Array<TileVisibility>(this.rows * this.cols).fill(TileVisibility.UNEXPLORED)
        this.visibleSet = new Set<number>()
    }

    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    setVisibility(row: number, col: number, visibility: TileVisibility) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            this.visibilityArray[index] = visibility
            if (visibility === TileVisibility.VISIBLE) {
                this.visibleSet.add(index)
            }
        }
    }

    resetAll() {
        this.visibilityArray.fill(TileVisibility.UNEXPLORED)
        this.visibleSet.clear()
    }

    reset() {
        for (const index of this.visibleSet) {
            this.visibilityArray[index] = TileVisibility.HIDDEN
        }
        this.visibleSet.clear()
    }

    calculateFOV(entity: Entity) {
        for (let row = entity.row - FOV_DISTANCE; row < entity.row + entity.height + FOV_DISTANCE; row++) {
            for (let col = entity.col - FOV_DISTANCE; col < entity.col + entity.width + FOV_DISTANCE; col++) {
                this.setVisibility(row, col, TileVisibility.VISIBLE)
            }
        }
    }
}