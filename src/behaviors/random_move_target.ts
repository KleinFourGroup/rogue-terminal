import { COLORS } from "../colors"
import { Entity } from "../entity"
import { getIdle } from "../idle_action"
import { getSmoothMove } from "../move_action"
import { TilePosition } from "../position"
import { IBehaviorLogic } from "./behavior"

export class RandomMoveTargetAI implements IBehaviorLogic {
    entity: Entity
    target: TilePosition | null
    momentum: TilePosition
    block: boolean

    constructor(entity: Entity, block: boolean) {
        this.entity = entity
        this.target = null
        this.momentum = {row: 0, col: 0}
        this.block = block
    }

    setMomentum(row: number, col: number) {
        this.momentum.row = row
        this.momentum.col = col
    }

    clearMomentum() {
        this.momentum.row = 0
        this.momentum.col = 0
    }

    getAction() {
        const world = this.entity.system !== null ? this.entity.system.world : null

        if (world === null) {
            return getIdle(this.entity, this.block)
        }

        if (this.target !== null && this.entity.row === this.target.row && this.entity.col === this.target.col) {
            world.ground.setHighlight(this.target.row, this.target.col, null)
            this.target = null
        }

        if (this.target === null) {
            do {
                this.target = {
                    row: Math.floor(Math.random() * world.rows),
                    col: Math.floor(Math.random() * world.cols)
                }
            } while (!world.isNavigable(this.target.row, this.target.col))
            
            world.ground.setHighlight(this.target.row, this.target.col, COLORS.DARK_NEON_RED)
        }

        const navGraph = world.getNavigationGraph(this.target.row, this.target.col, [this.entity])
        const nextPosition = navGraph.navigate(this.entity.row, this.entity.col, this.momentum)

        if (nextPosition === null) {
            world.ground.setHighlight(this.target.row, this.target.col, null)
            this.target = null
            this.clearMomentum()
            return getIdle(this.entity, this.block)
        }

        const action = getSmoothMove(this.entity, nextPosition.row, nextPosition.col, this.block)
        this.setMomentum(nextPosition.row - this.entity.row, nextPosition.col - this.entity.col)

        return action
    }
    
}