import { EntityGrid, EntityGridSignals } from "../entity_grid"
import { SignalEmitter } from "../signal"
import { IEntitySprite } from "../text/entity_sprite"
import { TileVisibilitySignals, VisibilityManager } from "./visibility_manager"

export interface EntityVisibilitySignals<EntityType extends IEntitySprite> {
    onReveal: SignalEmitter<EntityType>
    onHide: SignalEmitter<EntityType>
}

export class EntityVisibilityTracker<EntityType extends IEntitySprite> {
    entities: EntityGrid<EntityType>
    visibilityManager: VisibilityManager
    visibleEntities: Set<EntityType>
    signals: EntityVisibilitySignals<EntityType>

    constructor(entities: EntityGrid<EntityType>, visibilityManager: VisibilityManager) {
        this.entities = entities
        this.visibilityManager = visibilityManager
        this.visibleEntities = new Set<EntityType>()
        this.signals = {
            onReveal: new SignalEmitter<EntityType>(),
            onHide: new SignalEmitter<EntityType>()
        }
    }

    setupListeners(tileSignals: TileVisibilitySignals, entitySignals: EntityGridSignals<EntityType>) {
        const visibleCallback = (indices: Set<number>) => {
            for (const index of indices) {
                const col = index % this.entities.cols
                const row = (index - col) / this.entities.cols
                const entity = this.entities.getEntity(row, col)
                if (entity !== null) {
                    if (!this.visibleEntities.has(entity)) {
                        this.visibleEntities.add(entity)
                        this.signals.onReveal.emit(entity)
                    }
                }
            }
        }

        const hideCallback = (indices: Set<number>) => {
            for (const index of indices) {
                const col = index % this.entities.cols
                const row = (index - col) / this.entities.cols
                const entity = this.entities.getEntity(row, col)
                if (entity !== null) {
                    if (this.visibleEntities.has(entity)) {
                        if (!this.visibilityManager.isEntityVisible(entity)) {
                            this.visibleEntities.delete(entity)
                            this.signals.onHide.emit(entity)
                        }
                    }
                }
            }
        }

        const addCallback = (entity: EntityType) => {
            if (this.visibilityManager.isEntityVisible(entity)) {
                this.visibleEntities.add(entity)
                this.signals.onReveal.emit(entity)
            }
        }

        const deleteCallback = (entity: EntityType) => {
            if (this.visibleEntities.has(entity)) {
                this.visibleEntities.delete(entity)
                this.signals.onHide.emit(entity)
            }
        }

        const moveCallback = (entity: EntityType) => {
            if (this.visibilityManager.isEntityVisible(entity)) {
                if (!this.visibleEntities.has(entity)) {
                    this.visibleEntities.add(entity)
                    this.signals.onReveal.emit(entity)
                }
            } else {
                if (this.visibleEntities.has(entity)) {
                    this.visibleEntities.delete(entity)
                    this.signals.onHide.emit(entity)
                }
            }
        }

        tileSignals.onTileVisible.subscribe(visibleCallback)
        tileSignals.onTileHide.subscribe(hideCallback)
        entitySignals.onAdd.subscribe(addCallback)
        entitySignals.onDelete.subscribe(deleteCallback)
        entitySignals.onMove.subscribe(moveCallback)
    }
}