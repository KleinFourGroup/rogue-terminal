import { TextSprite } from "./text_sprite"
import { LayerCompositor } from "../animation/layers"

export interface IEntitySprite {
    sprite: TextSprite
    compositor: LayerCompositor

    row: number
    col: number

    width: number
    height: number

    compose(): void
    setPosition(row: number, col: number): void
}