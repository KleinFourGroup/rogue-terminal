import { Container, Graphics } from "pixi.js"
import { Entity } from "./entity"
import { World } from "./world"
import { AILogic } from "./behaviors/behavior"
import { SignalEmitter } from "./signal"

interface ECSSignals {
    onAdd: SignalEmitter<Entity>
    onDelete: SignalEmitter<Entity>
}

export class ECS {
    entities: Entity[]
    grid: (Entity | null)[]
    rows: number
    cols: number
    world: World | null
    visibleMask: Graphics | null
    stage: Container
    signals: ECSSignals

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols

        this.entities = []
        this.grid = new Array<Entity | null>(this.rows * this.cols).fill(null)
        this.world = null

        this.visibleMask = null

        this.signals = {
            onAdd: new SignalEmitter<Entity>,
            onDelete: new SignalEmitter<Entity>
        }

        this.stage = new Container()
    }

    setVisibilityMask(mask: Graphics) {
        this.visibleMask = mask
        this.stage.mask = mask
        this.stage.addChild(mask)
    }

    setWorld(world: World | null) {
        if (world !== null) {
            console.assert(world.rows === this.rows && world.cols === this.cols)
        }
        
        this.world = world
    }

    addToGrid(entity: Entity) {
        for (let row = entity.row; row < entity.row + entity.height; row++) {
            for (let col = entity.col; col < entity.col + entity.width; col++) {
                if (this.isValid(row, col)) {
                    const index = row * this.cols + col
                    if (this.grid[index] !== null) {
                        return false
                    }

                    this.grid[index] = entity
                }
            }
        }

        return true
    }

    deleteFromGrid(entity: Entity) {
        for (let row = entity.row; row < entity.row + entity.height; row++) {
            for (let col = entity.col; col < entity.col + entity.width; col++) {
                if (this.isValid(row, col)) {
                    const index = row * this.cols + col
                    if (this.grid[index] === entity) {
                        this.grid[index] = null
                    } else {
                        console.assert(false)
                    }
                }
            }
        }
    }
    
    addEntity(entity: Entity) {
        if (this.entities.indexOf(entity) < 0) {
            const success = this.addToGrid(entity)
            if (success) {
                this.entities.push(entity)
                entity.setECS(this)
                this.stage.addChild(entity.sprite)
            } else {
                this.deleteFromGrid(entity)
            }

            this.signals.onAdd.emit(entity)
        }
    }

    removeEntity(entity: Entity) {
        const index = this.entities.indexOf(entity)
        if (index >= 0) {
            this.entities.splice(index, 1)
            entity.setECS(null)
            this.deleteFromGrid(entity)
            this.stage.removeChild(entity.sprite)

            this.signals.onDelete.emit(entity)
        }
    }

    moveEntity(entity: Entity, row: number, col: number) {
        this.deleteFromGrid(entity)
        entity.setPosition(row, col)
        const success = this.addToGrid(entity)

        if (!success) {
            // Should revert instead, maybe?
            this.removeEntity(entity)
        }

        return success
    }

    getEntity(row: number, col: number) {
        return this.grid[row * this.cols + col]
    }

    isFree(row: number, col: number, ignoreList: Entity[] = []) {
        // console.log("Testing: ", row, col)
        if (this.isValid(row, col)) {
            const entity = this.grid[row * this.cols + col]
            return entity === null || ignoreList.indexOf(entity) >= 0
        }

        return true
    }

    isValid(row: number, col: number) {
        return 0 <= row && row < this.rows && 0 <= col && col < this.cols
    }

    getActive() {
        return this.entities.filter((entity: Entity) => entity.animationManager.isActive())
    }

    nextAI() {
        const hasAI = this.entities.filter((entity: Entity) => entity.getComponent(AILogic) !== null)

        if (hasAI.length > 0) {
            return hasAI.reduce((currMin: Entity, entity: Entity) => entity.actor.actionCoolDown < currMin.actor.actionCoolDown ? entity : currMin, hasAI[0])
        }

        return null
    }

    advanceTicks(ticks: number) {
        console.log(`Skipping ahead ${ticks} ticks`)
        for (const entity of this.entities) {
            entity.actor.advanceTicks(ticks)
        }
    }
}