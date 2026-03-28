import { IdleAction } from "../action/idle_action"
import { MoveAction } from "../action/move_action"
import { Entity } from "../entity"
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
            return new IdleAction(this.entity)
        }

        const index = Math.floor(Math.random() * validMoves.length)
        const action = new MoveAction(this.entity, this.world.entities, {
            row: this.entity.row + validMoves[index].row,
            col: this.entity.col + validMoves[index].col
        }, {row: this.entity.row, col: this.entity.col}, {cooldown: this.cooldown})

        return action
    }
    
}