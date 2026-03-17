import { AnimationResult, AnimationStatus, IAnimation } from "./animation"
import { Entity } from "./entity"
import { Component } from "./component"
import { SignalEmitter } from "./signal"
import { ActorSignal } from "./actor"

export enum AnimatorSignal {
    STEP,
    FINISHED
}

export class AnimationManager extends Component {
    declare entity: Entity

    activeAnimation: IAnimation | null
    onStep: SignalEmitter<AnimatorSignal>

    constructor(entity: Entity) {
        super()
        this.setEntity(entity)
        this.activeAnimation = null
        this.onStep = new SignalEmitter<AnimatorSignal>()
    }

    setupListener(onAct: SignalEmitter<ActorSignal>) {
        const actorCallback = (message: ActorSignal) => {
            switch (message) {
                case ActorSignal.ANIMATION_CONTINUE:
                    let overflow = this.activeAnimation!.currentStatus().overflow
                    this.animate(overflow)
                    break
                case ActorSignal.ANIMATION_SKIP:
                    this.advance()
                    break
                default:
                    throw new Error(`(AnimationManager.actorCallback) Unexpected ActorSignal: ${message}`)
            }
        }

        onAct.subscribe(actorCallback)
    }

    isActive() {
        return this.activeAnimation !== null
    }

    setActiveAnimation(animation: IAnimation, init: boolean = false) {
        this.activeAnimation = animation
        if (init) {
            this.activeAnimation.init(0)
        }
    }

    handleResult(result: AnimationResult) {
        switch (result.status) {
            case AnimationStatus.ANIMATION_FINISHED:
                this.activeAnimation = null
                this.onStep.emit(AnimatorSignal.FINISHED)
                break
            case AnimationStatus.ANIMATION_STEP:
                this.onStep.emit(AnimatorSignal.STEP)
                break
            case AnimationStatus.ANIMATION_PROGRESS:
                // No-op
                break
            case AnimationStatus.ANIMATION_ERROR:
                // Should never happen, so...
                this.activeAnimation = null
                this.onStep.emit(AnimatorSignal.FINISHED)
                break
            default:
                throw new Error(`(AnimationManager.handleResult) Unexpected status: ${result.status}`)
        }
    }

    animate(deltaMS: number) {
        const result = this.activeAnimation!.animate(deltaMS)
        this.handleResult(result)
    }
    
    advance() {
        const result = this.activeAnimation!.advance()
        this.handleResult(result)
    }
}