import { Entity } from "./entity"
import { TilePosition } from "./position"
import { SignalEmitter } from "./signal"

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

export interface ActionStepSignal<T> {
    status: ActionStatus
    animationData: T
}

export type ActionCallback<T> = (entity: Entity, actionData: T) => ActionResult

interface IAction<T, A> {
    entity: Entity
    actionData: T

    tickLength: number

    onStep: SignalEmitter<ActionStepSignal<A>>

    init(): ActionStatus
    advance(): ActionStatus
    finish(): ActionStatus

    currentStatus(): ActionStatus
}

