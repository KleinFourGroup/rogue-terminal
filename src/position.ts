import { TILE_SIZE } from "./text_sprite"

export type TilePosition = {
    row: number,
    col: number
}

export function tileToPixel(row: number, col: number, width: number, height: number) {
    return [col * TILE_SIZE + width * TILE_SIZE / 2, row * TILE_SIZE + height * TILE_SIZE / 2]
}