import { CanvasStyleCache } from "./text/style_cache"
import { TextCanvasCache } from "./text/text_cache"

export class CacheManager {
    canvasCache: TextCanvasCache
    styleCache: CanvasStyleCache

    constructor() {
        this.canvasCache = new TextCanvasCache()
        this.styleCache = new CanvasStyleCache()
    }
}