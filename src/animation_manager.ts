import { IAnimation } from "./animation/animation"
import { Entity } from "./entity"
import { Component } from "./component"

export enum AnimatorStatus {
    IDLE,
    NOT_STARTED,
    ACTIVE
}

export class AnimationManager extends Component {
    declare entity: Entity
    activeAnimation: IAnimation | null
    status: AnimatorStatus

    constructor(entity: Entity) {
        super()
        this.setEntity(entity)
        this.status = AnimatorStatus.IDLE
        this.activeAnimation = null
    }

    isActive() {
        return this.status === AnimatorStatus.ACTIVE
    }

    setActiveAnimation(animation: IAnimation, init: boolean = false) {
        this.activeAnimation = animation
        this.status = AnimatorStatus.NOT_STARTED
        if (init) {
            this.initAnimation()
        }
    }

    initAnimation() {
        if (this.status === AnimatorStatus.NOT_STARTED) {
            this.status = AnimatorStatus.ACTIVE
            this.activeAnimation!.init(0)
        }
    }

    animate(deltaMS: number) {
        if (this.status === AnimatorStatus.NOT_STARTED) {
            this.status = AnimatorStatus.ACTIVE
        }
        if (this.status === AnimatorStatus.ACTIVE) {
            this.activeAnimation!.animate(deltaMS)
            if (this.activeAnimation!.isFinished()) {
                this.activeAnimation = null
                this.status = AnimatorStatus.IDLE
            }
        }
    }
    
    finish() {
        if (this.status === AnimatorStatus.NOT_STARTED) {
            this.status = AnimatorStatus.ACTIVE
        }
        if (this.status === AnimatorStatus.ACTIVE) {
            this.activeAnimation!.finish()
            this.activeAnimation = null
            this.status = AnimatorStatus.IDLE
        }
    }
}