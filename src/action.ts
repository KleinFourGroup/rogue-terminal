import { IAnimation } from "./animation"
import { Entity } from "./entity"
import { Scene } from "./scene"

export enum ActionStatus {
    ACTION_NOT_STARTED,
    ACTION_PROGRESS,
    ACTION_FAILED,
    ACTION_FINISHED
}

export type ActionCallback = (entity: Entity, scene: Scene | null) => boolean

export interface IAction {
    entity: Entity
    scene: Scene | null

    elapsed: number
    animation: IAnimation
    tickLength: number

    blocking: boolean

    init(): ActionStatus
    finish(): ActionStatus
    advance(deltaMS: number): ActionStatus

    currentStatus(): ActionStatus
}

export class InstantAction implements IAction {
    elapsed: number
    callback: ActionCallback
    animation: IAnimation
    tickLength: number

    blocking: boolean

    status: ActionStatus

    entity: Entity
    scene: Scene | null

    constructor(entity: Entity, callback: ActionCallback, animation: IAnimation, tickLength: number, blocking: boolean = false, scene: Scene | null = null) {
        this.entity = entity
        this.callback = callback
        this.animation = animation
        this.tickLength = tickLength
        this.blocking = blocking

        this.scene = scene
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
    
    advance(_deltaMS: number): ActionStatus {
        const success = this.callback(this.entity, this.scene)
        this.status = success ? ActionStatus.ACTION_FINISHED : ActionStatus.ACTION_FAILED
        return this.status
    }

    currentStatus(): ActionStatus {
        return this.status
    }
}