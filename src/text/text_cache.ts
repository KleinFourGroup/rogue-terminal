import { TextCanvas, TextCanvasStyle } from "./text_canvas";

class StyledTextCanvasCache {
    style: TextCanvasStyle
    cache: Map<string, TextCanvas>

    constructor(style: TextCanvasStyle) {
        this.style = style
        this.cache = new Map<string, TextCanvas>()
    }

    getCanvas(text: string) {
        if (this.cache.has(text)) {
            return this.cache.get(text)!
        }

        const canvas = new TextCanvas(this.style)
        canvas.writeText(text)
        this.cache.set(text, canvas)

        return canvas
    }
}

export class TextCanvasCache {
    cache: Map<string, StyledTextCanvasCache>

    constructor() {
        this.cache = new Map<string, StyledTextCanvasCache>()
    }

    getSubCache(style: TextCanvasStyle) {
        const styleKey = style.styleHash()
        if (this.cache.has(styleKey)) {
            return this.cache.get(styleKey)!
        }

        const subCache = new StyledTextCanvasCache(style)
        this.cache.set(styleKey, subCache)

        return subCache
    }

    getCanvas(style: TextCanvasStyle, text: string) {
        return this.getSubCache(style).getCanvas(text)
    }
}