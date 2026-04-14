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
    options: TextSpriteOptions
    textCanvas: TextCanvas

    constructor(character: string, options: Partial<TextSpriteOptions> = {}) {
        const fullOptions = { ...DEFAULT_OPTIONS, ...options}
        const textCanvas = (fullOptions.cache === null) ? new TextCanvas(fullOptions.style) : fullOptions.cache.getCanvas(fullOptions.style, character)
        if (fullOptions.cache === null) {
            textCanvas.writeText(character)
        }

        super(Texture.from(textCanvas.canvas))
        this.character = character
        this.options = fullOptions
        this.textCanvas = textCanvas
    }

    clone() {
        return new TextSprite(this.character, this.options)
    }

    setCharacter(character: string) {
        this.character = character

        if (this.options.cache === null) {
            this.textCanvas.writeText(this.character)
        } else {
            const textCanvas = this.options.cache.getCanvas(this.options.style, this.character)
            // TODO: Check if pixi caches this, or if I have to make another cache
            this.texture = Texture.from(textCanvas.canvas)
            this.textCanvas = textCanvas
        }
    }
}