import { Entity } from "../entity"
import { SignalEmitter } from "../signal"


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

    setupListeners(onAddEntity: SignalEmitter<Entity>, onRemoveEntity: SignalEmitter<Entity>) {
        const addCallback = (entity: Entity) => {
            entity.cacheOverlaps(this.cols)
            this.register(entity)
        }
        const removeCallback = (entity: Entity) => {
            this.unregister(entity)
        }

        onAddEntity.subscribe(addCallback)
        onRemoveEntity.subscribe(removeCallback)
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
