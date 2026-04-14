import { TextSprite } from "./text_sprite"
import { LayerCompositor } from "../animation/layers"
import { TextSequence } from "./text_sequence"

export interface IEntitySprite {
    characters: TextSequence
    sprite: TextSprite
    compositor: LayerCompositor

    row: number
    col: number

    width: number
    height: number

    compose(): void
    setPosition(row: number, col: number): void
    step(count: number): void
}