import { Component } from "../component"
import { MemoryEntity } from "./memory_entity"
import { MemoryGrid } from "./memory_grid"

export class FogMemory extends Component {
    memory: MemoryEntity | null
    grid: MemoryGrid

    constructor(grid: MemoryGrid) {
        super()
        this.memory = null
        this.grid = grid
    }

    makeMemory() {
        if (this.entity !== null) {
            if (this.memory !== null) {
                this.grid.removeEntity(this.memory)
            }
            this.memory = new MemoryEntity(this.entity)
            this.grid.addEntity(this.memory)
        }
    }

    eraseMemory() {
        if (this.memory !== null) {
            this.grid.removeEntity(this.memory)
        }
        this.memory = null
    }
}