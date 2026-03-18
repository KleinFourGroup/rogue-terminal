import { AnimationResult, AnimationStatus, IAnimation } from "./animation/animation"
import { Entity } from "./entity"
import { Component } from "./component"
import { SignalEmitter } from "./signal"
import { ActorSignal } from "./actor"

export enum AnimatorSignal {
    STEP,
    FINISHED
}

export enum AnimatorStatus {
    IDLE,
    NOT_STARTED,
    ACTIVE
}

export class AnimationManager extends Component {
    declare entity: Entity

    status: AnimatorStatus
    activeAnimation: IAnimation | null
    onStep: SignalEmitter<AnimatorSignal>

    constructor(entity: Entity) {
        super()
        this.setEntity(entity)
        this.status = AnimatorStatus.IDLE
        this.activeAnimation = null
        this.onStep = new SignalEmitter<AnimatorSignal>()
    }

    setupListener(onAct: SignalEmitter<ActorSignal>) {
        const actorCallback = (message: ActorSignal) => {
            console.log("Animator", this.entity!.id, "recieved message:", ActorSignal[message])
            switch (message) {
                case ActorSignal.ANIMATION_START:
                    this.initAnimation()
                    break
                case ActorSignal.ANIMATION_CONTINUE:
                    let overflow = this.activeAnimation!.currentStatus().overflow
                    this.animate(overflow)
                    break
                case ActorSignal.ANIMATION_SKIP:
                    this.advance()
                    break
                default:
                    throw new Error(`(AnimationManager.actorCallback) Unexpected ActorSignal: ${ActorSignal[message]}`)
            }
        }

        onAct.subscribe(actorCallback)
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

    handleResult(result: AnimationResult) {
        switch (result.status) {
            case AnimationStatus.ANIMATION_FINISHED:
                this.status = AnimatorStatus.IDLE
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
                this.status = AnimatorStatus.IDLE
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