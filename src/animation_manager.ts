import { IStaticAnimation } from "./static_animation"
import { Entity } from "./entity"

export class AnimationManager {
    entity: Entity

    activeAnimation: IStaticAnimation | null

    constructor(entity: Entity) {
        this.entity = entity
        this.activeAnimation = null
    }

    isActive() {
        return this.activeAnimation !== null
    }

    setActiveAnimation(animation: IStaticAnimation) {
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