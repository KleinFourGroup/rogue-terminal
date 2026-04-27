import { IdleAction } from "../action/idle_action"
import { MoveAction } from "../action/move_action"
import { Entity } from "../entity"
import { WorldNavigator } from "../navigation/navigator"
import { NodePool } from "../navigation/node_pool"
import { TilePosition } from "../position"
import { World } from "../world"
import { IBehaviorLogic } from "./behavior"
import { UserInput, UserInputDescription } from "./user_input"

export class PlayerMoveTargetAI implements IBehaviorLogic {
    entity: Entity
    shouldWait: boolean
    target: TilePosition | null
    momentum: TilePosition
    block: boolean
    cooldown: number
    navigator: WorldNavigator
    pool: NodePool | null

    constructor(entity: Entity, world: World, block: boolean, pool: NodePool | null = null, cooldown: number = 1200) {
        this.entity = entity
        this.shouldWait = false
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
        if (this.target !== null){
            for (let row = 0; row < this.entity.height; row++) {
                for (let col = 0; col < this.entity.width; col++) {
                    this.navigator.world.ground.alertLayer.clearAlert(this.target.row + row, this.target.col + col, this.entity)
                }
            }
        }
    }

    setTarget(target: TilePosition | null) {
        this.clearAlert()

        if (this.target === null) {
            this.target = target
        } else if (target !== null) {
            this.target = null
        }

        if (this.target !== null) {
            this.setAlert()
        }
    }
    
    passInput(input: UserInputDescription) {
        switch(input.inputType) {
            case UserInput.IDLE:
                this.setTarget(null)
                this.shouldWait = true
                break
            case UserInput.MOVE:
                this.setTarget(input.inputData.destination)
                break
            default:
                const exhaustivenessCheck: never = input
                throw new Error(`(passInput) ${JSON.stringify(exhaustivenessCheck)}`)
        }
    }

    getAction() {
        if (this.target !== null && this.entity.row === this.target.row && this.entity.col === this.target.col) {
            this.clearAlert()
            this.target = null
        }

        if (this.target === null) {
            if (this.shouldWait) {
                this.shouldWait = false
                return new IdleAction(this.entity, {cooldown: this.cooldown})
            }
            return null
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
            return new IdleAction(this.entity, {cooldown: this.cooldown})
        }

        const action = new MoveAction(this.entity, this.navigator.world.entities, nextPosition, {row: this.entity.row, col: this.entity.col}, {cooldown: this.cooldown})
        this.setMomentum(nextPosition.row - this.entity.row, nextPosition.col - this.entity.col)

        return action
    }
    
}