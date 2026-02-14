import { IAnimation } from "./animation"
import { Entity } from "./entity"
import { Scene } from "./scene"

export type ActionCallback = (entity: Entity, scene: Scene) => boolean

export class Action {
    callback: ActionCallback
    animation: IAnimation
    tickLength: number

    scene: Scene | null

    constructor(callback: ActionCallback, animation: IAnimation, tickLength: number, scene: Scene | null = null) {
        this.callback = callback
        this.animation = animation
        this.tickLength = tickLength

        this.scene = scene
    }
}