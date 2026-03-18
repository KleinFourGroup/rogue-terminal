import { TILE_SIZE } from "./text/canvas_style"

export enum GridDirection {
    NW = 0,
    NN,
    NE,
    WW,
    EE,
    SW,
    SS,
    SE
}

export type TilePosition = {
    row: number,
    col: number
}

export const TILE_OFFSETS: Record<GridDirection, TilePosition> = {
    [GridDirection.NW]: {row: -1, col: -1},
    [GridDirection.NN]: {row: -1, col: 0},
    [GridDirection.NE]: {row: -1, col: 1},
    [GridDirection.WW]: {row: 0, col: -1},
    [GridDirection.EE]: {row: 0, col: 1},
    [GridDirection.SW]: {row: 1, col: -1},
    [GridDirection.SS]: {row: 1, col: 0},
    [GridDirection.SE]: {row: 1, col: 1}
}

export const DIRS = Object.values(GridDirection).filter((val) => typeof val === "number")

export function randomDirection() {
    return DIRS[Math.floor(Math.random() * DIRS.length)]
}

export function toFlatArrayOffsets(tileOffset: TilePosition, cols: number) {
    return tileOffset.row * cols + tileOffset.col
}

export function tileToPixel(row: number, col: number, width: number, height: number) {
    return [col * TILE_SIZE + width * TILE_SIZE / 2, row * TILE_SIZE + height * TILE_SIZE / 2]
}

export class TilePositionSet implements Iterable<TilePosition> {
    positions: Map<string, TilePosition>

    static hash(tile: TilePosition) {
        return `${tile.row},${tile.col}`
    }

    constructor(...tileSets: Iterable<TilePosition>[]) {
        this.positions = new Map<string, TilePosition>()
        for (const tileSet of tileSets) {
            for (const tile of tileSet) {
                this.add(tile)
            }
        }
    }

    add(tile: TilePosition) {
        this.positions.set(TilePositionSet.hash(tile), tile)
    }

    delete(tile: TilePosition) {
        this.positions.delete(TilePositionSet.hash(tile))
    }

    has(tile: TilePosition) {
        return this.positions.has(TilePositionSet.hash(tile))
    }

    [Symbol.iterator](): Iterator<TilePosition, any, any> {
        return this.positions.values()
    }
}