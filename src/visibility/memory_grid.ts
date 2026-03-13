import { EntityGrid } from "../entity_grid"
import { MemoryEntity } from "./memory_entity"

export class MemoryGrid extends EntityGrid<MemoryEntity> {
    constructor(rows: number, cols: number) {
        super(rows, cols)
    }

    // NO-OPs
    addHook(_entity: MemoryEntity) {}
    removeHook(_entity: MemoryEntity) {}
}