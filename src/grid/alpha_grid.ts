import { Entity } from "../entity"
import { EntityGridSignals } from "../entity_grid"
import { MemoryEntity } from "../visibility/memory_entity"
import { TileVisibilitySignals } from "../visibility/visibility_manager"


export class AlphaGrid {
    rows: number
    cols: number

    ownership: Set<Entity>[]
    dirty: Set<number>

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols

        this.ownership = Array.from({ length: this.rows * this.cols }, () => new Set<Entity>())
        this.dirty = new Set<number>()
    }

    setupListeners(entitySignals: EntityGridSignals<Entity>, memorySignals: EntityGridSignals<MemoryEntity>, tileSignals: TileVisibilitySignals) {
        const addCallback = (entity: Entity) => {
            entity.cacheOverlaps(this.cols)
            this.register(entity)
        }

        const removeCallback = (entity: Entity) => {
            this.unregister(entity)
        }

        const forgetCallback = (memory: MemoryEntity) => {
            for (let row = memory.row; row < memory.row + memory.height; row++) {
                for (let col = memory.col; col < memory.col + memory.width; col++) {
                    this.dirty.add(row * this.cols + col)
                }
            }
        }

        const visibilityCallback = (indices: Set<number>) => {
            for (const index of indices) {
                this.dirty.add(index)
            }
        }

        entitySignals.onAdd.subscribe(addCallback)
        entitySignals.onDelete.subscribe(removeCallback)
        memorySignals.onDelete.subscribe(forgetCallback)
        tileSignals.onTileVisible.subscribe(visibilityCallback)
        tileSignals.onTileHide.subscribe(visibilityCallback)
    }

    register(entity: Entity) {
        for (const [index, _overlap] of entity.overlapCache) {
            this.ownership[index].add(entity)
            this.dirty.add(index)
        }
    }

    unregister(entity: Entity) {
        for (const [index, _overlap] of entity.overlapCache) {
            this.ownership[index].delete(entity)
            this.dirty.add(index)
        }
    }
}
