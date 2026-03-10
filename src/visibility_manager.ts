import { Graphics } from "pixi.js"
import { Entity } from "./entity"
import { TILE_SIZE } from "./text/canvas_style"
import { COLORS } from "./colors"
import { SignalEmitter } from "./signal"

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
    visibleTileSet: Set<number>
    visibleTileCache: Set<number>
    visibleTileMask: Graphics
    
    onTileVisible: SignalEmitter<Set<number>>
    onTileHide: SignalEmitter<Set<number>>

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols

        this.visibilityArray = new Array<TileVisibility>(this.rows * this.cols).fill(TileVisibility.UNEXPLORED)
        this.visibleTileSet = new Set<number>()
        this.visibleTileCache = new Set<number>()
        this.visibleTileMask = new Graphics()
        
        this.onTileVisible = new SignalEmitter<Set<number>>()
        this.onTileHide = new SignalEmitter<Set<number>>()
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
                this.visibleTileSet.add(index)
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
        this.visibleTileCache = new Set<number>(this.visibleTileSet)
        this.visibilityArray.fill(TileVisibility.UNEXPLORED)
        this.visibleTileSet.clear()
        this.visibleTileMask.clear()
    }

    reset() {
        this.visibleTileCache = new Set<number>(this.visibleTileSet)
        for (const index of this.visibleTileSet) {
            this.visibilityArray[index] = TileVisibility.HIDDEN
        }
        this.visibleTileSet.clear()
        this.visibleTileMask.clear()
    }

    calculateFOV(entity: Entity) {
        for (let row = entity.row - FOV_DISTANCE; row < entity.row + entity.height + FOV_DISTANCE; row++) {
            for (let col = entity.col - FOV_DISTANCE; col < entity.col + entity.width + FOV_DISTANCE; col++) {
                this.setVisibility(row, col, TileVisibility.VISIBLE)
                this.visibleTileMask.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(COLORS.TERMINAL_BLACK)
            }
        }

        this.onTileVisible.emit(this.visibleTileSet.difference(this.visibleTileCache))
    }

    calculateNewlyHidden() {
        this.onTileHide.emit(this.visibleTileCache.difference(this.visibleTileSet))
    }
}