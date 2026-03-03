import { DEFAULT_STYLE, TextCanvasStyle } from "./canvas_style"

export class CanvasStyleCache {
    cache: Map<string, TextCanvasStyle>

    constructor() {
        this.cache = new Map<string, TextCanvasStyle>()
        this.cache.set(DEFAULT_STYLE.styleHash(), DEFAULT_STYLE)
    }

    getStyle(tileSize: number, fontsize: number, color: string) {
        const hash = TextCanvasStyle.hash(tileSize, fontsize, color)

        if (this.cache.has(hash)) {
            return this.cache.get(hash)
        }

        const style = new TextCanvasStyle(tileSize, fontsize, color)
        this.cache.set(hash, style)

        return style
    }
}