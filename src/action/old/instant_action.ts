import { ActionCallback, ActionResult, ActionStatus } from "./action"
import { ActionSequence, ActionSequenceOptions } from "./action_sequence"
import { Entity } from "../entity"

function NOOP<T>(entity: Entity, _actionData: T): ActionResult {
    return {
        status: ActionStatus.ACTION_FINISHED,
        footprint: entity.footprint()
    }
}

export class InstantAction<T> extends ActionSequence<T> {
    constructor(entity: Entity, actionData: T, tickLength: number, step: ActionCallback<T>, options: Partial<ActionSequenceOptions<T>> = {}) {
        const blocking = options.blocking === undefined ? true : options.blocking

        function stepWrapper(entity: Entity, actionData: T) {
            let result = step(entity, actionData)
            result.status = result.status === ActionStatus.ACTION_FINISHED ? ActionStatus.ACTION_PROCEED : result.status
            return result
        }

        super(entity, actionData, tickLength, blocking ? [stepWrapper, NOOP<T>] : [step], options)
    }
}