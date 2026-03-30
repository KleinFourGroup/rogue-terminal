import { IAction } from "./action/action"
import { Entity } from "./entity"
import { Component } from "./component"

export class Actor extends Component {
    declare entity: Entity
    currAction: IAction | null
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

    doAction(action: IAction) {
        this.setAction(action)
        return this.act()
    }

    setAction(action: IAction) {
        if (this.isReady()) {
            this.currAction = action
        }
    }

    act() {
        const result = this.currAction!.act()

        if (result !== null) {
            this.actionCoolDown = this.currAction!.tickLength
        }

        return result
    }

    advanceTicks(ticks: number) {
        this.actionCoolDown = Math.max(this.actionCoolDown - ticks, 0)
    }
}