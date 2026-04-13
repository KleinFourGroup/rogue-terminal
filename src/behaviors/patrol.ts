import { IdleAction } from "../action/idle_action"
import { MoveAction } from "../action/move_action"
import { Entity } from "../entity"
import { WorldNavigator } from "../navigation/navigator"
import { NodePool } from "../navigation/node_pool"
import { TilePosition } from "../position"
import { World } from "../world"
import { IBehaviorLogic, InputTarget } from "./behavior"

export class PatrolAI implements IBehaviorLogic {
    entity: Entity
    targets: TilePosition[]
    targetIndex: number
    momentum: TilePosition
    cooldown: number
    navigator: WorldNavigator
    pool: NodePool | null

    constructor(entity: Entity, world: World, targets: TilePosition[], pool: NodePool | null = null, cooldown: number = 1200) {
        this.entity = entity
        this.targets = targets
        this.targetIndex = 0
        this.momentum = {row: 0, col: 0}
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
        const target = this.targets[this.targetIndex]
        for (let row = 0; row < this.entity.height; row++) {
            for (let col = 0; col < this.entity.width; col++) {
                this.navigator.world.ground.alertLayer.setAlert(target.row + row, target.col + col, this.entity)
            }
        }
    }

    clearAlert() {
        const target = this.targets[this.targetIndex]
        for (let row = 0; row < this.entity.height; row++) {
            for (let col = 0; col < this.entity.width; col++) {
                this.navigator.world.ground.alertLayer.clearAlert(target.row + row, target.col + col, this.entity)
            }
        }
    }

    passInput(_target: InputTarget) {}

    getAction() {
        let target = this.targets[this.targetIndex]

        if (target !== null && this.entity.row === target.row && this.entity.col === target.col) {
            this.clearAlert()
            this.targetIndex = (this.targetIndex + 1) % this.targets.length
            this.setAlert()
            target = this.targets[this.targetIndex]
        }

        const navGraph = this.navigator.getNavigationGraph(target.row, target.col,
            {width: this.entity.width, height: this.entity.height, ignoreList: [this.entity], target: {row: this.entity.row, col: this.entity.col}, pool: this.pool})
        const nextPosition = navGraph.navigate(this.entity.row, this.entity.col, this.momentum)

        if (this.pool !== null) {
            navGraph.freeNodes(this.pool)
        }

        if (nextPosition === null) {
            this.clearMomentum()
            return new IdleAction(this.entity, {cooldown: this.cooldown})
        }

        const action = new MoveAction(this.entity, this.navigator.world.entities, nextPosition, {row: this.entity.row, col: this.entity.col}, {cooldown: this.cooldown})
        this.setMomentum(nextPosition.row - this.entity.row, nextPosition.col - this.entity.col)

        return action
    }
    
}