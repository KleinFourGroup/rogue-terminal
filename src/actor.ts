import { ActionStatus } from "./action"
import { IStaticAction } from "./static_action"
import { Entity } from "./entity"
import { Component } from "./component"

export class Actor extends Component {
    declare entity: Entity
    currAction: IStaticAction<any> | null
    actionCoolDown: number

    constructor(entity: Entity) {
        super()
        this.setEntity(entity)
        this.currAction = null
        this.actionCoolDown = 0
    }

    isReady() {
        return this.actionCoolDown === 0
    }

    isIdle() {
        return this.currAction === null
    }

    isBlocking() {
        return this.currAction?.blocking
    }

    doAction(action: IStaticAction<any>) {
        if (this.isReady()) {
            this.currAction = action
            this.advanceAction(0)
        }
    }

    setAction(action: IStaticAction<any>) {
        if (this.isReady()) {
            this.currAction = action
        }
    }

    advanceAction(deltaMS: number) {
        console.assert(this.currAction !== null)
        
        if (this.currAction?.currentStatus() === ActionStatus.ACTION_NOT_STARTED) {
            this.entity.animationManager.setActiveAnimation(this.currAction.animation)
        }

        const result = this.currAction!.advance(deltaMS, null)

        if (result === ActionStatus.ACTION_FINISHED) {
            this.actionCoolDown = this.currAction!.tickLength
            this.currAction = null
        }

        return result
    }

    advanceTicks(ticks: number = 1) {
        this.actionCoolDown = Math.max(this.actionCoolDown - ticks, 0)
    }
}