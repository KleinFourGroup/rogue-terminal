import { Container } from "pixi.js"
import { TextSprite } from "./text_sprite"

export interface IEntitySprite {
    sprite: TextSprite
    graphics: Container

    row: number
    col: number

    width: number
    height: number

    setPosition(row: number, col: number): void
}