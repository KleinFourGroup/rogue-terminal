import { Entity } from "./entity"
import { TilePosition } from "./position"

export enum ActionStatus {
    ACTION_NOT_STARTED,
    ACTION_PROCEED,
    ACTION_FAILED,
    ACTION_FINISHED
}

export interface ActionResult {
    status: ActionStatus
    footprint: TilePosition[]
}

export type ActionCallback<T> = (entity: Entity, actionData: T) => ActionResult

export interface IAction<T> {
    entity: Entity
    actionData: T

    tickLength: number

    init(): ActionResult
    advance(): ActionResult
    finish(): ActionResult
    abort(): ActionResult

    currentStatus(): ActionResult
}

