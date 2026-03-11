import { Container, Graphics } from "pixi.js"
import { IEntitySprite } from "./text/entity_sprite"

export interface IEntityGrid<EntityType extends IEntitySprite> {
    entities: EntityType[]
    grid: (EntityType | null)[]
    rows: number
    cols: number
    visibleMask: Graphics | null
    stage: Container

    setVisibilityMask(mask: Graphics): void
    addToGrid(entity: EntityType): boolean
    deleteFromGrid(entity: EntityType): boolean
    addEntity(entity: EntityType): void
    removeEntity(entity: EntityType): void
    getEntity(row: number, col: number): EntityType | null
    isFree(row: number, col: number, ignoreList: EntityType[]): boolean
    isValid(row: number, col: number): boolean
}