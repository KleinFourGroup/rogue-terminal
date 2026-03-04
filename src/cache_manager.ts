import { NodePool } from "./navigation_graph"
import { CanvasStyleCache } from "./text/style_cache"
import { TextCanvasCache } from "./text/text_cache"

export class CacheManager {
    canvasCache: TextCanvasCache
    styleCache: CanvasStyleCache
    navNodePool: NodePool

    constructor() {
        this.canvasCache = new TextCanvasCache()
        this.styleCache = new CanvasStyleCache()
        this.navNodePool = new NodePool()
    }
}