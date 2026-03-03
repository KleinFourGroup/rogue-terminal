import { TextCanvasCache } from "./text/text_cache"

export class CacheManager {
    canvasCache: TextCanvasCache

    constructor() {
        this.canvasCache = new TextCanvasCache()
    }
}