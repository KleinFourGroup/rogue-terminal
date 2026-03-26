import { BasicAction, BasicActionDescription } from "../action/basic_action"

export function basicActionAnimator(action: BasicActionDescription): number {
    switch(action.turnType) {
        case BasicAction.IDLE:
            // TODO
            return 0
        case BasicAction.MOVE:
            // TODO
            return 0
        default:
            const exhaustivenessCheck: never = action
            throw new Error(`(basicActionAnimator) Uh-oh ${JSON.stringify(exhaustivenessCheck)}`)
    }
}