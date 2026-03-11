import { Component } from "./component"
import { MemoryEntity } from "./memory_entity"

export class FogMemory extends Component {
    memory: MemoryEntity | null

    constructor() {
        super()
        this.memory = null
    }

    makeMemory() {
        if (this.entity !== null) {
            this.memory = new MemoryEntity(this.entity)
        }
    }

    eraseMemory() {
        this.memory = null
    }
}