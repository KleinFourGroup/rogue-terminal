import { Entity } from "../entity"
import { getIdle } from "../idle_action"
import { getSmoothMove } from "../move_action"
import { TILE_OFFSETS, randomDirection } from "../position"
import { IBehaviorLogic } from "./behavior"

export class RandomWalkAI implements IBehaviorLogic {
    entity: Entity
    block: boolean

    constructor(entity: Entity, block: boolean) {
        this.entity = entity
        this.block = block
    }

    getAction() {
        const world = this.entity.system !== null ? this.entity.system.world : null

        if (world === null) {
            return getIdle(this.entity, this.block)
        }

        let dx = 0, dy = 0
        do {
            const DIR = TILE_OFFSETS[randomDirection()]
            dx = DIR.col
            dy = DIR.row
        } while (!world.isNavigable(this.entity.row + dy, this.entity.col + dx))

        const action = getSmoothMove(this.entity, this.entity.row + dy, this.entity.col + dx, this.block)
        return action
    }
    
}