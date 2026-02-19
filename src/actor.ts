import { ActionStatus, IAction } from "./action"
import { Entity } from "./entity"

export class Actor {
    entity: Entity
    currAction: IAction | null
    actionCoolDown: number

    constructor(entity: Entity) {
        this.entity = entity
        this.currAction = null
        this.actionCoolDown = 0
    }

    isReady() {
        return this.actionCoolDown == 0
    }

    isIdle() {
        return this.currAction === null
    }

    isBlocking() {
        return this.currAction?.blocking
    }

    doAction(action: IAction) {
        if (this.isReady()) {
            this.currAction = action
            this.advanceAction(0)
        }
    }

    setAction(action: IAction) {
        if (this.isReady()) {
            this.currAction = action
        }
    }

    advanceAction(deltaMS: number) {
        console.assert(this.currAction !== null)
        
        if (this.currAction?.currentStatus() === ActionStatus.ACTION_NOT_STARTED) {
            this.entity.animationManager.setActiveAnimation(this.currAction.animation)
        }

        const result = this.currAction!.advance(deltaMS)

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