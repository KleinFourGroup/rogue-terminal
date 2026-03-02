import { Sprite, Texture } from "pixi.js"
import { TextCanvas } from "./text_canvas"

export const TILE_SIZE = 64

export class TextSprite extends Sprite {
    character: string
    textCanvas: TextCanvas

    constructor(character: string) {
        const textCanvas = new TextCanvas(TILE_SIZE)
        textCanvas.writeText(character)

        super(Texture.from(textCanvas.canvas))
        this.character = character
        this.textCanvas = textCanvas
    }
}