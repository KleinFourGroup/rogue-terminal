import { Action } from "./action"
import { Entity } from "./entity"

export class Actor {
    entity: Entity
    actionCoolDown: number

    constructor(entity: Entity) {
        this.entity = entity
        this.actionCoolDown = 0
    }

    isReady() {
        return this.actionCoolDown == 0
    }

    doAction(action: Action) {
        if (this.isReady()) {
            action.callback(this.entity, action.scene!)
            this.entity.animationManager.setActiveAnimation(action.animation)
            this.actionCoolDown = action.tickLength
        }
    }

    advance(ticks: number = 1) {
        this.actionCoolDown = Math.max(this.actionCoolDown - ticks, 0)
    }
}