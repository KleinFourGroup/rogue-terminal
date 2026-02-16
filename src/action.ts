import { IAnimation } from "./animation"
import { Entity } from "./entity"
import { Scene } from "./scene"

export type ActionCallback = (entity: Entity, scene: Scene) => boolean

export interface IAction {
    elapsed: number
    tickLength: number

    init(): void
    finish(): void
    advance(deltaMS: number): void

    isFinished(): boolean
}

export class Action implements IAction {
    elapsed: number
    callback: ActionCallback
    animation: IAnimation
    tickLength: number

    scene: Scene | null

    constructor(callback: ActionCallback, animation: IAnimation, tickLength: number, scene: Scene | null = null) {
        this.callback = callback
        this.animation = animation
        this.tickLength = tickLength

        this.scene = scene
        this.elapsed = 0
    }

    init(): void {
        throw new Error("Method not implemented.")
    }
    finish(): void {
        throw new Error("Method not implemented.")
    }
    advance(deltaMS: number): void {
        throw new Error("Method not implemented.")
    }
    isFinished(): boolean {
        throw new Error("Method not implemented.")
    }
}