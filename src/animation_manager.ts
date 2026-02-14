import { IAnimation } from "./animation"
import { Entity } from "./entity"

export class AnimationManager {
    entity: Entity

    activeAnimation: IAnimation | null

    constructor(entity: Entity) {
        this.entity = entity
        this.activeAnimation = null
    }

    setActiveAnimation(animation: IAnimation) {
        this.activeAnimation = animation
    }
}