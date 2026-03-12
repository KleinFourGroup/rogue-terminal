import { Container, Graphics } from "pixi.js"
import { TextSprite } from "../text/text_sprite"
import { TILE_SIZE } from "../text/canvas_style"
import { Entity } from "../entity"
import { AlphaGrid } from "./alpha_grid"
import { AlertGrid } from "./alert_grid"
import { TileVisibility, TileVisibilitySignals, VisibilityManager } from "../visibility_manager"
import { MemoryGrid } from "../memory_grid"
import { EntityGridSignals } from "../entity_grid"
import { MemoryEntity } from "../memory_entity"

export class BackgroundGrid extends Container {
    rows: number
    cols: number

    textArray: (TextSprite | null)[]
    colorArray: (Graphics | null)[]
    validArray: boolean[]

    textLayer: Container
    alertLayer: AlertGrid
    colorLayer: Container

    alphaManager: AlphaGrid

    constructor(rows: number, cols: number) {
        super()
        this.rows = rows
        this.cols = cols

        this.textArray = new Array<TextSprite | null>(this.rows * this.cols).fill(null)
        this.colorArray = new Array<Graphics | null>(this.rows * this.cols).fill(null)
        this.validArray = new Array<boolean>(this.rows * this.cols).fill(false)

        this.textLayer = new Container()
        this.alertLayer = new AlertGrid(this.rows, this.cols)
        this.colorLayer = new Container()

        this.alphaManager = new AlphaGrid(this.rows, this.cols)

        this.addChild(this.colorLayer)
        this.addChild(this.alertLayer)
        this.addChild(this.textLayer)
    }

    // setupListeners(onAddEntity: SignalEmitter<Entity>, onRemoveEntity: SignalEmitter<Entity>, onTileVisible: SignalEmitter<Set<number>>, onTileHide: SignalEmitter<Set<number>>) {
    setupListeners(entitySignals: EntityGridSignals<Entity>, memorySignals: EntityGridSignals<MemoryEntity>, tileSignals: TileVisibilitySignals) {
        this.alphaManager.setupListeners(entitySignals, memorySignals, tileSignals)
        this.alertLayer.setupListeners(entitySignals.onDelete)
    }

    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    isValid(row: number, col: number) {
        if (this.isInBounds(row, col)) {
            return this.validArray[row * this.cols + col]
        }

        return false
    }

    setValid(row: number, col: number, valid: boolean = true) {
        if (this.isInBounds(row, col)) {
            this.validArray[row * this.cols + col] = valid
        }
    }

    getText(row: number, col: number) {
        if (this.isInBounds(row, col)) {
            return this.textArray[row * this.cols + col]
        }

        return null
    }

    setText(row: number, col: number, sprite: TextSprite) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            this.textArray[index] = sprite
            this.textLayer.addChild(sprite)

            sprite.position.set(col * TILE_SIZE, row * TILE_SIZE)

            // Hideous insert sort, but in theory this should only be done once anyways, so...
            const laterChildren = this.textArray.filter((val, ind) => ind > index && val !== null) as TextSprite[]
            for (const child of laterChildren) {
                this.textLayer.removeChild(child)
                this.textLayer.addChild(child)
            }
        }
    }

    getColor(row: number, col: number) {
        if (this.isInBounds(row, col)) {
            return this.colorArray[row * this.cols + col]
        }

        return null
    }

    setColor(row: number, col: number, color: string) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col

            if (this.colorArray[index] !== null) {
                const graphics = this.colorArray[index]
                graphics.clear()
                graphics.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color)
            } else {
                const graphics =  new Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color)
                this.colorArray[index] = graphics
                this.colorLayer.addChild(graphics)
                
                graphics.position.set(col * TILE_SIZE, row * TILE_SIZE)

                // Hideous insert sort, but in theory this should only be done once anyways, so...
                const laterChildren = this.colorArray.filter((val, ind) => ind > index && val !== null) as Graphics[]
                for (const child of laterChildren) {
                    this.colorLayer.removeChild(child)
                    this.colorLayer.addChild(child)
                }
            }
        }
    }

    updateTileAlphas(activeEntities: Entity[], visibilityManager: VisibilityManager, memories: MemoryGrid) {
        for (const entity of activeEntities) {
            this.alphaManager.unregister(entity)
            entity.cacheOverlaps(this.cols)
            this.alphaManager.register(entity)
        }

        for (const index of this.alphaManager.dirty) {
            const textSprite = this.textArray[index]
            if (textSprite !== null) {
                textSprite.alpha = 1

                if (visibilityManager.visibilityArray[index] === TileVisibility.VISIBLE) {
                    for (const entity of this.alphaManager.ownership[index]) {
                        textSprite.alpha = Math.min(textSprite.alpha, entity.overlapCache.get(index)!)
                    }
                } else {
                    const col = index % this.cols
                    const row = (index - col) / this.cols
                    textSprite.alpha = memories.getEntity(row, col) !== null ? 0 : 1
                }
            }
        }

        const updated = this.alphaManager.dirty.size
        this.alphaManager.dirty.clear()
        return updated
    }
}