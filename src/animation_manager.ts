import { IAnimation } from "./animation"
import { Entity } from "./entity"

export class AnimationManager {
    entity: Entity

    activeAnimation: IAnimation | null

    constructor(entity: Entity) {
        this.entity = entity
        this.activeAnimation = null
    }

    isIdle() {
        return this.activeAnimation === null
    }

    setActiveAnimation(animation: IAnimation) {
        this.activeAnimation = animation
        this.activeAnimation.init(0)
    }

    animate(deltaMS: number) {
        this.activeAnimation?.animate(deltaMS)
        
        if (this.activeAnimation?.isFinished()) {
            this.activeAnimation = null
        }
    }
}