import { Sprite, Texture } from "pixi.js"
import { TextCanvas } from "./text_canvas"
import { TextCanvasCache } from "./text_cache"
import { DEFAULT_STYLE, TextCanvasStyle } from "./canvas_style"

export class TextSprite extends Sprite {
    character: string
    textCanvas: TextCanvas

    constructor(character: string, cache: TextCanvasCache | null = null, style: TextCanvasStyle = DEFAULT_STYLE) {
        const textCanvas = (cache === null) ? new TextCanvas(style) : cache.getCanvas(DEFAULT_STYLE, character)
        if (cache === null) {
            textCanvas.writeText(character)
        }

        super(Texture.from(textCanvas.canvas))
        this.character = character
        this.textCanvas = textCanvas
    }
}