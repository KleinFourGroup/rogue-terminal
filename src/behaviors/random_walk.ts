import { Entity } from "../entity"
import { getIdle } from "../idle_action"
import { getSmoothMove } from "../move_action"
import { DIRS, TILE_OFFSETS, TilePosition } from "../position"
import { IBehaviorLogic } from "./behavior"

export class RandomWalkAI implements IBehaviorLogic {
    entity: Entity
    block: boolean
    cooldown: number

    constructor(entity: Entity, block: boolean, cooldown: number = 1200) {
        this.entity = entity
        this.block = block
        this.cooldown = cooldown
    }

    getAction() {
        const world = this.entity.system !== null ? this.entity.system.world : null

        if (world === null) {
            return getIdle(this.entity, this.block)
        }

        let validMoves: TilePosition[] = []
        
        for (const dir of DIRS) {
            const offsets = TILE_OFFSETS[dir]
            if (world.isNavigable(this.entity.row + offsets.row, this.entity.col + offsets.col, [this.entity], this.entity.width, this.entity.height)) {
                validMoves.push(offsets)
            }
        }

        if (validMoves.length === 0) {
            return getIdle(this.entity, this.block)
        }

        const index = Math.floor(Math.random() * validMoves.length)
        const action = getSmoothMove(this.entity, this.entity.row + validMoves[index].row, this.entity.col + validMoves[index].col, {blocking: this.block, cooldown: this.cooldown})

        return action
    }
    
}