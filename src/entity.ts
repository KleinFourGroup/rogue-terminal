import { TextSprite } from "./text_sprite";

export class Entity {
    sprite: TextSprite

    row: number
    col: number

    width: number
    height: number

    constructor(text: string, row: number = 0, col: number = 0, width: number = 1, height: number = 1) {
        this.sprite = new TextSprite(text)
        this.row = row
        this.col = col
        this.width = width
        this.height = height
    }
}