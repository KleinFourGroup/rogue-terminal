import { IAnimation } from "./animation"
import { Entity } from "./entity"
import { TilePosition } from "./position"

export enum ActionStatus {
    ACTION_NOT_STARTED,
    ACTION_PROGRESS,
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

    elapsed: number
    animation: IAnimation
    tickLength: number

    blocking: boolean

    init(): ActionStatus
    finish(): ActionStatus
    advance(deltaMS: number, actionData: T | null): ActionStatus

    currentStatus(): ActionStatus
}

export class InstantAction<T> implements IAction<T> {
    elapsed: number
    callback: ActionCallback<T>
    animation: IAnimation
    tickLength: number

    blocking: boolean

    status: ActionStatus

    entity: Entity
    actionData: T

    constructor(entity: Entity, callback: ActionCallback<T>, animation: IAnimation, tickLength: number, blocking: boolean = false, actionData: T) {
        this.entity = entity
        this.callback = callback
        this.animation = animation
        this.tickLength = tickLength
        this.blocking = blocking

        this.actionData = actionData
        this.elapsed = 0

        this.status = ActionStatus.ACTION_NOT_STARTED
    }
    
    init(): ActionStatus {
        return this.advance(0)
    }
    
    finish(): ActionStatus {
        if (this.status !== ActionStatus.ACTION_NOT_STARTED) {
            return this.status
        }

        return this.advance(0)
    }
    
    advance(_deltaMS: number, actionData: T | null = null): ActionStatus {
        const success = this.callback(this.entity, actionData !== null ? actionData : this.actionData)
        this.status = success.status ? ActionStatus.ACTION_FINISHED : ActionStatus.ACTION_FAILED
        return this.status
    }

    currentStatus(): ActionStatus {
        return this.status
    }
}