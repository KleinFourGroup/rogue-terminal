import { Container, Graphics } from "pixi.js"
import { IEntitySprite } from "./text/entity_sprite"
import { SignalEmitter } from "./signal"

export interface EntityGridSignals<EntityType extends IEntitySprite> {
    onAdd: SignalEmitter<EntityType>
    onDelete: SignalEmitter<EntityType>
    onMove: SignalEmitter<EntityType>
}

export interface IEntityGrid<EntityType extends IEntitySprite> {
    entities: EntityType[]
    grid: (EntityType | null)[]
    rows: number
    cols: number
    visibleMask: Graphics | null
    stage: Container
    signals: EntityGridSignals<EntityType>

    setVisibilityMask(mask: Graphics): void
    addToGrid(entity: EntityType): boolean
    deleteFromGrid(entity: EntityType): boolean
    addEntity(entity: EntityType): void
    removeEntity(entity: EntityType): void
    moveEntity(entity: EntityType, row: number, col: number): boolean
    getEntity(row: number, col: number): EntityType | null
    isFree(row: number, col: number, ignoreList: EntityType[]): boolean
    isValid(row: number, col: number): boolean
}