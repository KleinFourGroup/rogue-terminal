import { Container, Graphics } from "pixi.js"
import { IEntitySprite } from "./text/entity_sprite"
import { SignalEmitter } from "./signal"

export interface EntityGridSignals<EntityType extends IEntitySprite> {
    onAdd: SignalEmitter<EntityType>
    onDelete: SignalEmitter<EntityType>
    onMove: SignalEmitter<EntityType>
}

export abstract class EntityGrid<EntityType extends IEntitySprite> {
    entities: EntityType[]
    grid: (EntityType | null)[]
    rows: number
    cols: number
    visibleMask: Graphics | null
    stage: Container
    signals: EntityGridSignals<EntityType>

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols

        this.entities = []
        this.grid = new Array<EntityType | null>(this.rows * this.cols).fill(null)
        
        this.visibleMask = null
        
        this.signals = {
            onAdd: new SignalEmitter<EntityType>,
            onDelete: new SignalEmitter<EntityType>,
            onMove: new SignalEmitter<EntityType>
        }

        this.stage = new Container()
    }

    setVisibilityMask(mask: Graphics) {
        this.visibleMask = mask
        this.stage.mask = mask
        this.stage.addChild(mask)
    }

    addToGrid(entity: EntityType) {
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

    deleteFromGrid(entity: EntityType) {
        for (let row = entity.row; row < entity.row + entity.height; row++) {
            for (let col = entity.col; col < entity.col + entity.width; col++) {
                if (this.isValid(row, col)) {
                    const index = row * this.cols + col
                    if (this.grid[index] === entity) {
                        this.grid[index] = null
                    } else {
                        return false
                    }
                }
            }
        }

        return true
    }

    abstract addHook(entity: EntityType): void
    abstract removeHook(entity: EntityType): void
    
    addEntity(entity: EntityType) {
        if (this.entities.indexOf(entity) < 0) {
            const success = this.addToGrid(entity)
            if (success) {
                this.entities.push(entity)
                this.addHook(entity)
                this.stage.addChild(entity.sprite)
                this.signals.onAdd.emit(entity)
            } else {
                this.deleteFromGrid(entity)
            }
        }
    }

    removeEntity(entity: EntityType) {
        const index = this.entities.indexOf(entity)
        if (index >= 0) {
            this.removeHook(entity)
            this.entities.splice(index, 1)
            this.deleteFromGrid(entity)
            this.stage.removeChild(entity.sprite)

            this.signals.onDelete.emit(entity)
        }
    }

    moveEntity(entity: EntityType, row: number, col: number) {
        this.deleteFromGrid(entity)
        entity.setPosition(row, col)
        const success = this.addToGrid(entity)

        if (!success) {
            // Should revert instead, maybe?
            this.removeEntity(entity)
        } else {
            this.signals.onMove.emit(entity)
        }

        return success
    }

    getEntity(row: number, col: number) {
        return this.grid[row * this.cols + col]
    }

    isFree(row: number, col: number, ignoreList: EntityType[] = []) {
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
}