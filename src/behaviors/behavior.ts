import { IAction } from "../action/action"
import { IAnimation } from "../animation/animation"
import { Component } from "../component"
import { Entity } from "../entity"
import { getIdle } from "../action/idle_action"

export interface IBehaviorLogic {
    entity: Entity

    getAction(): readonly [IAction<any> | null, IAnimation | null]
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
        const [action, animation] = this.behaviorLogic.getAction()

        if (action === null || animation === null) {
            return getIdle(this.behaviorLogic.entity, true) // Something went wrong; be cautious
        }

        return [action!, animation!] as const
    }
}

// Keeping this as a helper function so as to not pollute the Entity class
export function setupAI(entity: Entity, logic: IBehaviorLogic) {
    console.assert(entity === logic.entity)

    let comp = entity.getComponent(AILogic)
    if (comp === null) {
        comp = new AILogic(logic)
        entity.addComponent(comp)
    } else {
        // This probably should never happen
        comp.setLogic(logic)
    }
}