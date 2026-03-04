import { Sprite, Texture } from "pixi.js"
import { TextCanvas } from "./text_canvas"
import { TextCanvasCache } from "./text_cache"
import { DEFAULT_STYLE, TextCanvasStyle } from "./canvas_style"

export interface TextSpriteOptions {
    cache: TextCanvasCache | null
    style: TextCanvasStyle
}

const DEFAULT_OPTIONS: TextSpriteOptions = {
    cache: null,
    style: DEFAULT_STYLE
}

export class TextSprite extends Sprite {
    character: string
    textCanvas: TextCanvas

    constructor(character: string, options: Partial<TextSpriteOptions> = {}) {
        const fullOptions = { ...DEFAULT_OPTIONS, ...options}
        const textCanvas = (fullOptions.cache === null) ? new TextCanvas(fullOptions.style) : fullOptions.cache.getCanvas(fullOptions.style, character)
        if (fullOptions.cache === null) {
            textCanvas.writeText(character)
        }

        super(Texture.from(textCanvas.canvas))
        this.character = character
        this.textCanvas = textCanvas
    }
}