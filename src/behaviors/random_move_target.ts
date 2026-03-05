import { COLORS } from "../colors"
import { Entity } from "../entity"
import { getIdle } from "../idle_action"
import { getSmoothMove } from "../move_action"
import { WorldNavigator } from "../navigation/navigator"
import { NodePool } from "../navigation/node_pool"
import { TilePosition } from "../position"
import { IBehaviorLogic } from "./behavior"

export class RandomMoveTargetAI implements IBehaviorLogic {
    entity: Entity
    target: TilePosition | null
    momentum: TilePosition
    block: boolean
    navigator: WorldNavigator | null
    pool: NodePool | null

    constructor(entity: Entity, block: boolean, pool: NodePool | null = null) {
        this.entity = entity
        this.target = null
        this.momentum = {row: 0, col: 0}
        this.block = block

        const world = this.entity.system !== null ? this.entity.system.world : null
        this.navigator = world !== null ? new WorldNavigator(world) : null
        this.pool = pool
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
        if (this.navigator === null) {
            return getIdle(this.entity, this.block)
        }

        if (this.target !== null && this.entity.row === this.target.row && this.entity.col === this.target.col) {
            this.navigator.world.ground.setHighlight(this.target.row, this.target.col, null)
            this.target = null
        }

        if (this.target === null) {
            do {
                this.target = {
                    row: Math.floor(Math.random() * this.navigator.world.rows),
                    col: Math.floor(Math.random() * this.navigator.world.cols)
                }
            } while (!this.navigator.world.isNavigable(this.target.row, this.target.col))
            
            this.navigator.world.ground.setHighlight(this.target.row, this.target.col, COLORS.DARK_NEON_RED)
        }

        const navGraph = this.navigator.getNavigationGraph(this.target.row, this.target.col, {ignoreList: [this.entity], pool: this.pool})
        const nextPosition = navGraph.navigate(this.entity.row, this.entity.col, this.momentum)

        if (this.pool !== null) {
            navGraph.freeNodes(this.pool)
        }

        if (nextPosition === null) {
            this.navigator.world.ground.setHighlight(this.target.row, this.target.col, null)
            this.target = null
            this.clearMomentum()
            return getIdle(this.entity, this.block)
        }

        const action = getSmoothMove(this.entity, nextPosition.row, nextPosition.col, this.block)
        this.setMomentum(nextPosition.row - this.entity.row, nextPosition.col - this.entity.col)

        return action
    }
    
}