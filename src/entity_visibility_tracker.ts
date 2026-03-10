import { ECS } from "./ecs"
import { Entity } from "./entity"
import { SignalEmitter } from "./signal"
import { VisibilityManager } from "./visibility_manager"

interface EntityVisibilitySignals {
    onReveal: SignalEmitter<Entity>
    onHide: SignalEmitter<Entity>
}

export class EntityVisibilityTracker {
    entities: ECS
    visibilityManager: VisibilityManager
    visibleEntities: Set<Entity>
    signals: EntityVisibilitySignals

    constructor(entities: ECS, visibilityManager: VisibilityManager) {
        this.entities = entities
        this.visibilityManager = visibilityManager
        this.visibleEntities = new Set<Entity>()
        this.signals = {
            onReveal: new SignalEmitter<Entity>(),
            onHide: new SignalEmitter<Entity>()
        }
    }

    setupListeners(onTileVisible: SignalEmitter<Set<number>>, onTileHide: SignalEmitter<Set<number>>, onAdd: SignalEmitter<Entity>, onDelete: SignalEmitter<Entity>, onMove: SignalEmitter<Entity>) {
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

        const addCallback = (entity: Entity) => {
            if (this.visibilityManager.isEntityVisible(entity)) {
                this.visibleEntities.add(entity)
                this.signals.onReveal.emit(entity)
            }
        }

        const deleteCallback = (entity: Entity) => {
            if (this.visibleEntities.has(entity)) {
                this.visibleEntities.delete(entity)
                this.signals.onHide.emit(entity)
            }
        }

        const moveCallback = (entity: Entity) => {
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