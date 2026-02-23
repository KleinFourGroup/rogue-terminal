import { TILE_SIZE } from "./text_sprite"

export enum GridDirections {
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

export const TILE_OFFSETS: Record<GridDirections, TilePosition> = {
    [GridDirections.NW]: {row: -1, col: -1},
    [GridDirections.NN]: {row: -1, col: 0},
    [GridDirections.NE]: {row: -1, col: 1},
    [GridDirections.WW]: {row: 0, col: -1},
    [GridDirections.EE]: {row: 0, col: 1},
    [GridDirections.SW]: {row: 1, col: -1},
    [GridDirections.SS]: {row: 1, col: 0},
    [GridDirections.SE]: {row: 1, col: 1}
}

export function randomDirection() {
    const dirs = Object.values(GridDirections).filter((val) => typeof val === "number")
    return dirs[Math.floor(Math.random() * dirs.length)]
}

export function toFlatArrayOffsets(tileOffset: TilePosition, cols: number) {
    return tileOffset.row * cols + tileOffset.col
}

export function tileToPixel(row: number, col: number, width: number, height: number) {
    return [col * TILE_SIZE + width * TILE_SIZE / 2, row * TILE_SIZE + height * TILE_SIZE / 2]
}