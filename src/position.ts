import { TILE_SIZE } from "./text_sprite"

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

export function randomDirection() {
    const dirs = Object.values(GridDirection).filter((val) => typeof val === "number")
    return dirs[Math.floor(Math.random() * dirs.length)]
}

export function toFlatArrayOffsets(tileOffset: TilePosition, cols: number) {
    return tileOffset.row * cols + tileOffset.col
}

export function tileToPixel(row: number, col: number, width: number, height: number) {
    return [col * TILE_SIZE + width * TILE_SIZE / 2, row * TILE_SIZE + height * TILE_SIZE / 2]
}