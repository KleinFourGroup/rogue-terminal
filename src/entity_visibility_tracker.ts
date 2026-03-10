import { ECS } from "./ecs"
import { Entity } from "./entity"
import { SignalEmitter } from "./signal"
import { VisibilityManager } from "./visibility_manager"

export class EntityVisibilityTracker {
    entities: ECS
    visibilityManager: VisibilityManager
    visibleEntities: Set<Entity>
    onReveal: SignalEmitter<Entity>
    onHide: SignalEmitter<Entity>

    constructor(entities: ECS, visibilityManager: VisibilityManager) {
        this.entities = entities
        this.visibilityManager = visibilityManager
        this.visibleEntities = new Set<Entity>()
        this.onReveal = new SignalEmitter<Entity>()
        this.onHide = new SignalEmitter<Entity>()
    }

    setupListeners(onTileVisible: SignalEmitter<Set<number>>, onTileHide: SignalEmitter<Set<number>>) {
        const visibleCallback = (indices: Set<number>) => {
            for (const index of indices) {
                const col = index % this.entities.cols
                const row = (index - col) / this.entities.cols
                const entity = this.entities.getEntity(row, col)
                if (entity !== null) {
                    if (!this.visibleEntities.has(entity)) {
                        this.visibleEntities.add(entity)
                        this.onReveal.emit(entity)
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
                            this.onHide.emit(entity)
                        }
                    }
                }
            }
        }

        onTileVisible.subscribe(visibleCallback)
        onTileHide.subscribe(hideCallback)
    }
}