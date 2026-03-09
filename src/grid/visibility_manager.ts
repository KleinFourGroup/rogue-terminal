import { Graphics } from "pixi.js"
import { Entity } from "../entity"
import { TILE_SIZE } from "../text/canvas_style"
import { COLORS } from "../colors"
import { SignalEmitter } from "../signal"

const FOV_DISTANCE = 5

export enum TileVisibility {
    UNEXPLORED,
    HIDDEN,
    VISIBLE
}

export class VisibilityManager {
    rows: number
    cols: number

    visibilityArray: TileVisibility[]
    visibleSet: Set<number>
    visibleCache: Set<number>
    visibleMask: Graphics
    
    onCalculateVisibility: SignalEmitter<Set<number>>

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols

        this.visibilityArray = new Array<TileVisibility>(this.rows * this.cols).fill(TileVisibility.UNEXPLORED)
        this.visibleSet = new Set<number>()
        this.visibleCache = new Set<number>()
        this.visibleMask = new Graphics()
        
        this.onCalculateVisibility = new SignalEmitter<Set<number>>()
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

    setVisibility(row: number, col: number, visibility: TileVisibility) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            this.visibilityArray[index] = visibility
            if (visibility === TileVisibility.VISIBLE) {
                this.visibleSet.add(index)
            }
        }
    }

    isEntityVisible(entity: Entity) {
        for (let row = entity.row; row < entity.row + entity.height; row++) {
            for (let col = entity.col; col < entity.col + entity.width; col++) {
                if (this.isInBounds(row, col) && this.visibilityArray[row * this.cols + col] === TileVisibility.VISIBLE) {
                    return true
                }
            }
        }

        return false
    }

    resetAll() {
        this.visibilityArray.fill(TileVisibility.UNEXPLORED)
        this.visibleCache = new Set<number>(this.visibleSet)
        this.visibleSet.clear()
        this.visibleMask.clear()
    }

    reset() {
        this.visibleCache = new Set<number>(this.visibleSet)
        for (const index of this.visibleSet) {
            this.visibilityArray[index] = TileVisibility.HIDDEN
        }
        this.visibleSet.clear()
        this.visibleMask.clear()
    }

    calculateFOV(entity: Entity) {
        for (let row = entity.row - FOV_DISTANCE; row < entity.row + entity.height + FOV_DISTANCE; row++) {
            for (let col = entity.col - FOV_DISTANCE; col < entity.col + entity.width + FOV_DISTANCE; col++) {
                this.setVisibility(row, col, TileVisibility.VISIBLE)
                this.visibleMask.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(COLORS.TERMINAL_BLACK)
            }
        }

        this.onCalculateVisibility.emit(this.visibleSet.symmetricDifference(this.visibleCache))
    }
}