import { Actor } from "./actor"
import { AnimationManager } from "./animation_manager"
import { CacheManager } from "./cache_manager"
import { ClassConstructor, Component } from "./component"
import { ECS } from "./ecs"
import { tileToPixel } from "./position"
import { DEFAULT_STYLE, TILE_SIZE } from "./text/canvas_style"
import { TextSprite } from "./text/text_sprite"

export class Entity {
    sprite: TextSprite

    row: number
    col: number

    width: number
    height: number

    system: ECS | null

    actor: Actor
    animationManager: AnimationManager
    overlapCache: Map<number, number>

    components: {[name: string]: Component}

    constructor(text: string, caches: CacheManager, row: number = 0, col: number = 0, width: number = 1, height: number = 1) {
        const size = Math.min(width, height)
        this.sprite = new TextSprite(text, {cache: caches.canvasCache, style: caches.styleCache.getStyle(size * TILE_SIZE, size * TILE_SIZE, DEFAULT_STYLE.color)}) // CACHE!
        this.row = row
        this.col = col
        this.width = width
        this.height = height

        this.system = null

        this.actor = new Actor(this)
        this.animationManager = new AnimationManager(this)
        this.overlapCache = new Map<number, number>()

        this.components = {}
        
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(...tileToPixel(this.row, this.col, this.width, this.height))
    }

    setPosition(row: number, col: number) {
        this.row = row
        this.col = col

        this.sprite.position.set(...tileToPixel(this.row, this.col, this.width, this.height))
        // console.log(this.row, this.col)
    }

    setECS(system: ECS | null) {
        this.system = system
    }

    getComponent<Comp extends Component>(comp: ClassConstructor<Comp>): Comp | null {
        const name = (comp as typeof Component).name
        if (this.components.hasOwnProperty(name)) {
            return this.components[name] as Comp
        }
        return null
    }

    addComponents(...components: Component[]) {
        for (const component of components) {
            this.components[(component.constructor as typeof Component).name] = component
            component.setEntity(this)
        }
    }

    hasComponents(...components: Component[]) {
        for (const component of components) {
            if (!this.components.hasOwnProperty((component.constructor as typeof Component).name)) {
                return false
            }
        }
        return true
    }

    tileCollision(row: number, col: number) {
        return (row >= this.row && row < this.row + this.height && col >= this.col && col < this.col + this.width)
    }
    
    cacheOverlaps(cols: number) {
        this.overlapCache.clear()

        const minX = this.sprite.position.x - this.sprite.width / 2
        const minY = this.sprite.position.y - this.sprite.height / 2
        const maxX = this.sprite.position.x + this.sprite.width / 2
        const maxY = this.sprite.position.y + this.sprite.height / 2

        const minRow = Math.floor(minY / TILE_SIZE)
        const minCol = Math.floor(minX / TILE_SIZE)
        const maxRow = maxY % TILE_SIZE === 0 ? Math.floor(maxY / TILE_SIZE) - 1 : Math.floor(maxY / TILE_SIZE)
        const maxCol = maxX % TILE_SIZE === 0 ? Math.floor(maxX / TILE_SIZE) - 1 : Math.floor(maxX / TILE_SIZE)

        const minRowf = minY / TILE_SIZE
        const minColf = minX / TILE_SIZE
        const maxRowf = maxY / TILE_SIZE
        const maxColf = maxX / TILE_SIZE

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const minRowBound = Math.max(row, minRowf)
                const maxRowBound = Math.min(row + 1, maxRowf)
                const minColBound = Math.max(col, minColf)
                const maxColBound = Math.min(col + 1, maxColf)
                
                const rowOverlap = Math.max(maxRowBound - minRowBound, 0)
                const colOverlap = Math.max(maxColBound - minColBound, 0)
                this.overlapCache.set(row * cols + col, 1 - Math.min(rowOverlap, colOverlap))
            }
        }
    }
}