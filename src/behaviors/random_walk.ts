import { Entity } from "../entity"
import { getIdle } from "../idle_action"
import { getSmoothMove } from "../move_action"
import { DIRS, TILE_OFFSETS, TilePosition } from "../position"
import { World } from "../world"
import { IBehaviorLogic } from "./behavior"

export class RandomWalkAI implements IBehaviorLogic {
    entity: Entity
    world: World
    block: boolean
    cooldown: number

    constructor(entity: Entity, world: World, block: boolean, cooldown: number = 1200) {
        this.entity = entity
        this.world = world
        this.block = block
        this.cooldown = cooldown
    }

    getAction() {
        let validMoves: TilePosition[] = []
        
        for (const dir of DIRS) {
            const offsets = TILE_OFFSETS[dir]
            if (this.world.isNavigable(this.entity.row + offsets.row, this.entity.col + offsets.col, [this.entity], this.entity.width, this.entity.height)) {
                validMoves.push(offsets)
            }
        }

        if (validMoves.length === 0) {
            return getIdle(this.entity, this.block)
        }

        const index = Math.floor(Math.random() * validMoves.length)
        const action = getSmoothMove(this.entity, this.world.entities, this.entity.row + validMoves[index].row, this.entity.col + validMoves[index].col, {blocking: this.block, cooldown: this.cooldown})

        return action
    }
    
}