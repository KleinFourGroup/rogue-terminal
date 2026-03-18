import { Entity } from "../entity"
import { TilePositionSet } from "../position"

export enum ActionStatus {
    ACTION_NOT_STARTED,
    ACTION_PROCEED,
    ACTION_FAILED,
    ACTION_FINISHED
}

export interface ActionResult {
    status: ActionStatus
    footprint: TilePositionSet
}

export type ActionCallback<T> = (entity: Entity, actionData: T) => ActionResult

export interface IAction<T> {
    entity: Entity
    actionData: T

    // This might get purged if we completely isolate the action and animation underlying subroutines
    initialBlock: boolean

    tickLength: number

    init(): ActionResult
    advance(): ActionResult
    finish(): ActionResult
    abort(): ActionResult

    currentStatus(): ActionResult
}

