import { CacheManager } from "./cache_manager"
import { ClassConstructor, Component } from "./component"
import { TilePositionSet, tileToPixel } from "./position"
import { SignalEmitter } from "./signal"
import { DEFAULT_STYLE, TILE_SIZE } from "./text/canvas_style"
import { IEntitySprite } from "./text/entity_sprite"
import { TextSprite } from "./text/text_sprite"
import { AnimationLayer, LayerCompositor } from "./animation/layers"
import { TextSequence } from "./text/text_sequence"

let ID_NUM = 0

interface EntitySignals {
    onAdd: SignalEmitter<Component>
    onRemove: SignalEmitter<Component>
}

export class Entity implements IEntitySprite {
    id: string

    characters: TextSequence
    sprite: TextSprite
    compositor: LayerCompositor

    row: number
    col: number

    width: number
    height: number

    overlapCache: Map<number, number>

    components: Map<ClassConstructor<any>, Component>
    signals: EntitySignals

    constructor(text: string | string[] | TextSequence, caches: CacheManager, row: number = 0, col: number = 0, width: number = 1, height: number = 1) {
        const characters = (typeof text === "string") ? TextSequence.fromString(text) : (Array.isArray(text)) ? new TextSequence(text) : text
        this.id = `${characters.getString()}#${ID_NUM++}`
        this.characters = characters
        const size = Math.min(width, height)
        this.sprite = new TextSprite(this.characters.getCurrent(), {cache: caches.canvasCache, style: caches.styleCache.getStyle(size * TILE_SIZE, size * TILE_SIZE, DEFAULT_STYLE.color)}) // CACHE!
        this.compositor = new LayerCompositor()
        this.row = row
        this.col = col
        this.width = width
        this.height = height

        this.overlapCache = new Map<number, number>()

        this.components = new Map()
        this.signals = {
            onAdd: new SignalEmitter<Component>,
            onRemove: new SignalEmitter<Component>
        }
        
        this.sprite.anchor.set(0.5)
        const [x, y] = tileToPixel(0, 0, this.width, this.height)
        this.compositor.setVector(AnimationLayer.BASE, x, y)
        this.compositor.setVector(AnimationLayer.LOCATION, this.col * TILE_SIZE, this.row * TILE_SIZE)
        this.compose()
    }

    compose() {
        const position = this.compositor.compose()
        this.sprite.position.set(position.x, position.y)
    }

    setPosition(row: number, col: number, forceDraw: boolean = false) {
        this.row = row
        this.col = col

        if (forceDraw) {
            this.compositor.setVector(AnimationLayer.LOCATION, this.col * TILE_SIZE, this.row * TILE_SIZE)
            this.compose()
        }
    }

    step(count: number = 1) {
        this.characters.step(count)
        this.sprite.setCharacter(this.characters.getCurrent())
    }

    footprint() {
        let result = new TilePositionSet()
        
        for (let row = this.row; row < this.row + this.height; row++) {
            for (let col = this.col; col < this.col + this.width; col++) {
                result.add({row: row, col: col})
            }
        }

        return result
    }

    getComponent<Comp extends Component>(comp: ClassConstructor<Comp>): Comp | null {
        if (this.components.has(comp)) {
            return this.components.get(comp) as Comp
        }
        return null
    }

    addComponent<Comp extends Component>(component: Comp) {
        this.components.set(component.constructor as ClassConstructor<Comp>, component)
        component.setEntity(this)
        this.signals.onAdd.emit(component)
    }

    removeComponent<Comp extends Component>(comp: ClassConstructor<Comp>) {
        if (this.components.has(comp)) {
            const component = this.components.get(comp)!
            this.components.delete(comp)
            component.setEntity(null)
            this.signals.onRemove.emit(component)
        }
    }

    hasComponent<Comp extends Component>(comp: ClassConstructor<Comp>) {
        return this.components.has(comp)
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

    cameraCoordinates() {
        const base = this.compositor.get(AnimationLayer.BASE).vector
        const position = this.compositor.get(AnimationLayer.LOCATION).vector

        return [base.x + position.x, base.y + position.y] as const
    }
}