import { IAction } from "../action"
import { Component } from "../component"
import { Entity } from "../entity"
import { getIdle } from "../idle_action"

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

    setLogic(behaviorLogic: IBehaviorLogic) {
        this.behaviorLogic = behaviorLogic
    }

    getAction() {
        const action = this.behaviorLogic.getAction()

        if (action === null) {
            return getIdle(this.behaviorLogic.entity, true) // Something went wrong; be cautious
        }

        return action
    }
}

// Keeping this as a helper function so as to not pollute the Entity class
export function setupAI(entity: Entity, logic: IBehaviorLogic) {
    console.assert(entity === logic.entity)

    let comp = entity.getComponent(AILogic)
    if (comp === null) {
        comp = new AILogic(logic)
        entity.addComponents(comp)
    } else {
        // This probably should never happen
        comp.setLogic(logic)
    }
}