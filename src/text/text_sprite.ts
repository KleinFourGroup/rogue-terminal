import { Sprite, Texture } from "pixi.js"
import { TextCanvas, TextCanvasStyle } from "./text_canvas"
import { COLORS } from "../colors"

export const TILE_SIZE = 64

export const DEFAULT_STYLE = new TextCanvasStyle(TILE_SIZE, TILE_SIZE, COLORS.TERMINAL_GREEN)

export class TextSprite extends Sprite {
    character: string
    textCanvas: TextCanvas

    constructor(character: string) {
        const textCanvas = new TextCanvas(DEFAULT_STYLE)
        textCanvas.writeText(character)

        super(Texture.from(textCanvas.canvas))
        this.character = character
        this.textCanvas = textCanvas
    }
}