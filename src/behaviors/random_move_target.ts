import { Entity } from "../entity"
import { getIdle } from "../idle_action"
import { getSmoothMove } from "../move_action"
import { WorldNavigator } from "../navigation/navigator"
import { NodePool } from "../navigation/node_pool"
import { TilePosition } from "../position"
import { World } from "../world"
import { IBehaviorLogic } from "./behavior"

export class RandomMoveTargetAI implements IBehaviorLogic {
    entity: Entity
    target: TilePosition | null
    momentum: TilePosition
    block: boolean
    cooldown: number
    navigator: WorldNavigator
    pool: NodePool | null

    constructor(entity: Entity, world: World, block: boolean, pool: NodePool | null = null, cooldown: number = 1200) {
        this.entity = entity
        this.target = null
        this.momentum = {row: 0, col: 0}
        this.block = block
        this.cooldown = cooldown

        this.navigator = new WorldNavigator(world)
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

    setAlert() {
        for (let row = 0; row < this.entity.height; row++) {
            for (let col = 0; col < this.entity.width; col++) {
                this.navigator.world.ground.alertLayer.setAlert(this.target!.row + row, this.target!.col + col, this.entity)
            }
        }
    }

    clearAlert() {
        for (let row = 0; row < this.entity.height; row++) {
            for (let col = 0; col < this.entity.width; col++) {
                this.navigator.world.ground.alertLayer.clearAlert(this.target!.row + row, this.target!.col + col, this.entity)
            }
        }
    }

    getAction() {
        if (this.target !== null && this.entity.row === this.target.row && this.entity.col === this.target.col) {
            this.clearAlert()
            this.target = null
        }

        if (this.target === null) {
            do {
                this.target = {
                    row: Math.floor(Math.random() * this.navigator.world.rows),
                    col: Math.floor(Math.random() * this.navigator.world.cols)
                }
            } while (!this.navigator.world.isNavigable(this.target.row, this.target.col, [this.entity], this.entity.width, this.entity.height))
            
            this.setAlert()
        }

        const navGraph = this.navigator.getNavigationGraph(this.target.row, this.target.col,
            {width: this.entity.width, height: this.entity.height, ignoreList: [this.entity], target: {row: this.entity.row, col: this.entity.col}, pool: this.pool})
        const nextPosition = navGraph.navigate(this.entity.row, this.entity.col, this.momentum)

        if (this.pool !== null) {
            navGraph.freeNodes(this.pool)
        }

        if (nextPosition === null) {
            this.clearAlert()
            this.target = null
            this.clearMomentum()
            return getIdle(this.entity, this.block)
        }

        const action = getSmoothMove(this.entity, this.navigator.world.entities, nextPosition.row, nextPosition.col, {blocking: this.block, cooldown: this.cooldown})
        this.setMomentum(nextPosition.row - this.entity.row, nextPosition.col - this.entity.col)

        return action
    }
    
}