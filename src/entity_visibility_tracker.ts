import { IEntityGrid } from "./entity_grid"
import { SignalEmitter } from "./signal"
import { IEntitySprite } from "./text/entity_sprite"
import { VisibilityManager } from "./visibility_manager"

interface EntityVisibilitySignals<EntityType extends IEntitySprite> {
    onReveal: SignalEmitter<EntityType>
    onHide: SignalEmitter<EntityType>
}

export class EntityVisibilityTracker<EntityType extends IEntitySprite> {
    entities: IEntityGrid<EntityType>
    visibilityManager: VisibilityManager
    visibleEntities: Set<EntityType>
    signals: EntityVisibilitySignals<EntityType>

    constructor(entities: IEntityGrid<EntityType>, visibilityManager: VisibilityManager) {
        this.entities = entities
        this.visibilityManager = visibilityManager
        this.visibleEntities = new Set<EntityType>()
        this.signals = {
            onReveal: new SignalEmitter<EntityType>(),
            onHide: new SignalEmitter<EntityType>()
        }
    }

    setupListeners(onTileVisible: SignalEmitter<Set<number>>, onTileHide: SignalEmitter<Set<number>>, onAdd: SignalEmitter<EntityType>, onDelete: SignalEmitter<EntityType>, onMove: SignalEmitter<EntityType>) {
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

        onTileVisible.subscribe(visibleCallback)
        onTileHide.subscribe(hideCallback)
        onAdd.subscribe(addCallback)
        onDelete.subscribe(deleteCallback)
        onMove.subscribe(moveCallback)
    }
}