import { Container, Point } from "pixi.js"
import { ECS } from "./ecs"
import { BackgroundGrid } from "./grid/background_grid"
import { Entity } from "./entity"
import { TextSprite } from "./text/text_sprite"
import { VisibilityManager } from "./visibility/visibility_manager"
import { EntityVisibilityTracker } from "./visibility/entity_visibility_tracker"
import { MemoryGrid } from "./visibility/memory_grid"
import { MemoryEntity } from "./visibility/memory_entity"
import { MemoryManager } from "./visibility/memory_manager"
import { VisibilitydGrid } from "./visibility/visibility_grid"
import { AnimationManager } from "./animation_manager"
import { TileVisibility } from "./visibility/tile_visibility"
import { VisibilityDisplay } from "./visibility/visibility_display"
import { HighlighterDisplay } from "./highlighter"
import { TILE_SIZE } from "./text/canvas_style"

export class World extends Container {
    rows: number
    cols: number

    visibilityLayer: VisibilitydGrid
    entities: ECS
    memories: MemoryGrid
    ground: BackgroundGrid
    
    visibilityManager: VisibilityManager
    memoryManager: MemoryManager
    visibleEntityTracker: EntityVisibilityTracker<Entity>
    visibleMemoryTracker: EntityVisibilityTracker<MemoryEntity>

    visibilityDisplay: VisibilityDisplay
    highlighter: HighlighterDisplay

    animatedActives: Entity[]

    constructor(rows: number, cols: number) {
        super()

        this.rows = rows
        this.cols = cols

        this.visibilityLayer = new VisibilitydGrid(this.rows, this.cols)
        this.entities = new ECS(this.rows, this.cols)
        this.memories = new MemoryGrid(this.rows, this.cols)
        this.ground = new BackgroundGrid(this.rows, this.cols)

        this.visibilityManager = new VisibilityManager(this.rows, this.cols)
        this.memoryManager = new MemoryManager(this.rows, this.cols, this.visibilityManager)
        this.visibleEntityTracker = new EntityVisibilityTracker<Entity>(this.entities, this.visibilityManager)
        this.visibleMemoryTracker = new EntityVisibilityTracker<MemoryEntity>(this.memories, this.visibilityManager)

        this.visibilityDisplay = new VisibilityDisplay(this.visibilityManager)

        this.highlighter = new HighlighterDisplay()

        this.ground.setupListeners(this.entities.signals, this.memories.signals, this.visibilityDisplay.signals)

        this.visibleEntityTracker.setupListeners(this.visibilityManager.signals, this.entities.signals)
        this.visibleMemoryTracker.setupListeners(this.visibilityManager.signals, this.memories.signals)
        this.memoryManager.setupListeners(this.visibleEntityTracker.signals, this.visibleMemoryTracker.signals)

        this.animatedActives = []

        this.entities.setWorld(this)

        this.addChild(this.ground)
        this.addChild(this.memories.stage)
        this.addChild(this.entities.stage)
        this.addChild(this.visibilityLayer)
        this.addChild(this.highlighter.highlight)

        this.setVisibilityMasks()
    }

    setVisibilityMasks() {
        this.entities.setVisibilityMask(this.visibilityDisplay.visibilityMasks[TileVisibility.VISIBLE])
        this.memories.setVisibilityMask(this.visibilityDisplay.visibilityMasks[TileVisibility.HIDDEN])
        this.ground.alertLayer.setVisibilityMask(this.visibilityDisplay.visibilityMasks[TileVisibility.VISIBLE])
    }

    isNavigable(row: number, col: number, ignoreList: Entity[] = [], width: number = 1, height: number = 1) {
        for (let checkRow = row; checkRow < row + height; checkRow++) {
            for (let checkCol = col; checkCol < col + width; checkCol++) {
                if (!this.entities.isFree(checkRow, checkCol, ignoreList) || !this.ground.isValid(checkRow, checkCol)) {
                    return false
                }
            }
        }

        return true
    }

    getTarget(pointer: Point | null) {
        if (pointer === null) {
            return null
        }

        const row = Math.floor(pointer.y / TILE_SIZE)
        const col = Math.floor(pointer.x / TILE_SIZE)
        
        return this.ground.isValid(row, col) ? {row: row, col: col} : null
    }

    addEntity(entity: Entity) {
        this.entities.addEntity(entity)
    }

    setValid(row: number, col: number, valid: boolean = true) {
        this.ground.setValid(row, col, valid)
    }

    setGroundText(row: number, col: number, sprite: TextSprite) {
        this.ground.setText(row, col, sprite)
    }

    setGroundColor(row: number, col: number, color: string) {
        this.ground.setColor(row, col, color)
    }

    nextAI() {
        return this.entities.nextAI()
    }

    advanceTicks(ticks: number) {
        this.entities.advanceTicks(ticks)
    }

    stepTextSequences() {
        for (const entity of this.entities.entities) {
            if (entity.characters.length > 1) {
                entity.step()
            }
        }

        for (const entity of this.memories.entities) {
            if (entity.characters.length > 1) {
                entity.step()
            }
        }
    }
    
    animateActive(deltaMS: number) {
        const activeEntities = this.entities.getActive()
        let unfinished = 0
        for (const entity of activeEntities) {
            entity.getComponent(AnimationManager)!.animate(deltaMS)
            if (entity.getComponent(AnimationManager)!.isActive()) {
                unfinished++
            }
        }

        this.animatedActives = activeEntities

        return unfinished
    }

    calculateView() {
        this.visibilityManager.reset()
        for (const entity of this.entities.getObservers()) {
            this.visibilityManager.calculateFOV(entity)
        }
        this.visibilityManager.emitDifferences()
    }

    drawView() {
        this.visibilityDisplay.cacheVisibilitySets()
        this.visibilityDisplay.updateVisibility()
        this.visibilityDisplay.emitDifferences()

        this.visibilityDisplay.clearVisibleMask()
        this.visibilityDisplay.drawMasks()
        this.visibilityLayer.draw(this.visibilityDisplay)
    }
}