import { Entity } from "./entity"
import { EntityVisibilitySignals } from "./entity_visibility_tracker"
import { FogMemory } from "./fog_memory"
import { MemoryEntity } from "./memory_entity"
import { VisibilityManager } from "./visibility_manager"

export class MemoryManager {
    rows: number
    cols: number
    visibilityManager: VisibilityManager

    constructor(rows: number, cols: number, visibilityManager: VisibilityManager) {
        this.rows = rows
        this.cols = cols

        this.visibilityManager = visibilityManager
    }

    setupListeners(entitySignals: EntityVisibilitySignals<Entity>, memorySignals: EntityVisibilitySignals<MemoryEntity>) {
        const entityReveal = (entity: Entity) => {
            if (entity.hasComponent(FogMemory)) {
                entity.getComponent(FogMemory)!.makeMemory()
            }
        }

        const memoryReveal = (memory: MemoryEntity) => {
            if (!memory.isUpToDate() && memory.original.hasComponent(FogMemory)) {
                memory.original.getComponent(FogMemory)!.eraseMemory()
            }
        }

        entitySignals.onReveal.subscribe(entityReveal)
        memorySignals.onReveal.subscribe(memoryReveal)
    }
}