import { ActionCallback, ActionResult, ActionStatus } from "./action"
import { ActionSequence } from "./action_sequence"
import { Entity } from "../entity"

export interface InstantActionOptions<T> {
    abortStep: ActionCallback<T> | null
    blocking: boolean
}

function NOOP<T>(entity: Entity, _actionData: T): ActionResult {
    return {
        status: ActionStatus.ACTION_FINISHED,
        footprint: entity.footprint()
    }
}

export class InstantAction<T> extends ActionSequence<T> {
    constructor(entity: Entity, actionData: T, tickLength: number, step: ActionCallback<T>, options: Partial<InstantActionOptions<T>> = {}) {
        const DEFAULT_OPTIONS: InstantActionOptions<T> = {
            abortStep: null,
            blocking: true
        }
        const fullOptions = { ...DEFAULT_OPTIONS, ...options}

        function stepWrapper(entity: Entity, actionData: T) {
            let result = step(entity, actionData)
            result.status = result.status === ActionStatus.ACTION_FINISHED ? ActionStatus.ACTION_PROCEED : result.status
            return result
        }

        super(entity, actionData, tickLength, fullOptions.blocking ? [stepWrapper, NOOP<T>] : [step], fullOptions.abortStep)
    }
}