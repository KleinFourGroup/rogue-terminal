import { TextSprite } from "./text_sprite"

export interface IEntitySprite {
    sprite: TextSprite

    row: number
    col: number

    width: number
    height: number
}