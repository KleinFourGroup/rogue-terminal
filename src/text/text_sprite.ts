import { Sprite, Texture } from "pixi.js"
import { TextCanvas, TextCanvasStyle } from "./text_canvas"
import { COLORS } from "../colors"
import { TextCanvasCache } from "./text_cache"

export const TILE_SIZE = 64

export const DEFAULT_STYLE = new TextCanvasStyle(TILE_SIZE, TILE_SIZE, COLORS.TERMINAL_GREEN)

export class TextSprite extends Sprite {
    character: string
    textCanvas: TextCanvas

    constructor(character: string, cache: TextCanvasCache | null = null) {
        const textCanvas = (cache === null) ? new TextCanvas(DEFAULT_STYLE) : cache.getCanvas(DEFAULT_STYLE, character)
        if (cache === null) {
            textCanvas.writeText(character)
        }

        super(Texture.from(textCanvas.canvas))
        this.character = character
        this.textCanvas = textCanvas
    }
}