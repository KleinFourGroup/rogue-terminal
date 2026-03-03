import { Entity } from "../entity"
import { getIdle } from "../idle_action"
import { getSmoothMove } from "../move_action"
import { GridDirection, TILE_OFFSETS, TilePosition } from "../position"
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

        let validMoves: TilePosition[] = []
        
        const dirs = Object.values(GridDirection).filter((val) => typeof val === "number")

        for (const dir of dirs) {
            const offsets = TILE_OFFSETS[dir]
            if (world.isNavigable(this.entity.row + offsets.row, this.entity.col + offsets.col)) {
                validMoves.push(offsets)
            }
        }

        if (validMoves.length === 0) {
            return getIdle(this.entity, this.block)
        }

        const index = Math.floor(Math.random() * validMoves.length)
        const action = getSmoothMove(this.entity, this.entity.row + validMoves[index].row, this.entity.col + validMoves[index].col, this.block)

        return action
    }
    
}