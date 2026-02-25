import { IAction } from "./action"
import { Component } from "./component"
import { Entity } from "./entity"
import { getSmoothMove } from "./move_action"
import { randomDirection, TILE_OFFSETS } from "./position"

export interface IBehaviorLogic {
    entity: Entity

    getAction(): IAction | null
}

export class AILogic extends Component {
    static name: string = "AI"
    behaviorLogic: IBehaviorLogic

    constructor(behaviorLogic: IBehaviorLogic) {
        super()
        this.behaviorLogic = behaviorLogic
    }

    getAction() {
        return this.behaviorLogic.getAction()
    }
}

export class RandomWalkAI implements IBehaviorLogic {
    entity: Entity
    block: boolean

    constructor(entity: Entity, block: boolean) {
        this.entity = entity
        this.block = block

        let comp = entity.getComponent(AILogic)
        if (comp === null) {
            comp = new AILogic(this)
            entity.addComponents(comp)
        } else {
            // This probably should never happen
            comp.behaviorLogic = this
        }
    }

    getAction() {
        const world = this.entity.system !== null ? this.entity.system.world : null

        if (world === null) {
            return null
        }

        let dx = 0, dy = 0
        do {
            const DIR = TILE_OFFSETS[randomDirection()]
            dx = DIR.col
            dy = DIR.row
        } while (!world.isNavigable(this.entity.row + dy, this.entity.col + dx))

        const action = getSmoothMove(this.entity, this.entity.row + dy, this.entity.col + dx, this.block)
        return action
    }
    
}