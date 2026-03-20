import { AnimationResult, AnimationStatus, IAnimation } from "./animation/animation"
import { Entity } from "./entity"
import { Component } from "./component"
import { SignalEmitter } from "./signal"
import { ActorMessage, ActorSignal } from "./actor"
import { TileVisibility, VisibilityManager } from "./visibility/visibility_manager"
import { TilePositionSet } from "./position"

export enum AnimatorSignal {
    STEP,
    FINISHED
}

export enum AnimatorStatus {
    IDLE,
    NOT_STARTED,
    ACTIVE
}

function checkVisibility(footprint: TilePositionSet, visibilityManager: VisibilityManager) {
    let visible = false

    for (const tile of footprint) {
        if (visibilityManager.getVisibility(tile.row, tile.col) === TileVisibility.VISIBLE) {
            visible = true
            break
        }
    }

    return visible
}

export class AnimationManager extends Component {
    declare entity: Entity

    visibilityManager: VisibilityManager | null

    status: AnimatorStatus
    activeAnimation: IAnimation | null
    onStep: SignalEmitter<AnimatorSignal>

    constructor(entity: Entity) {
        super()
        this.setEntity(entity)
        this.visibilityManager = null
        this.status = AnimatorStatus.IDLE
        this.activeAnimation = null
        this.onStep = new SignalEmitter<AnimatorSignal>()
    }

    setVisibilityManager(visibilityManager: VisibilityManager) {
        this.visibilityManager = visibilityManager
    }

    setupListener(onAct: SignalEmitter<ActorSignal>) {
        const actorCallback = (message: ActorSignal) => {
            console.log("Animator", this.entity!.id, "recieved message:", ActorMessage[message.message])
            switch (message.message) {
                case ActorMessage.ANIMATION_START:
                    this.initAnimation()
                    break
                case ActorMessage.ANIMATION_CONTINUE:
                    if (checkVisibility(message.footprint, this.visibilityManager!)) {
                        let overflow = this.activeAnimation!.currentStatus().overflow
                        this.animate(overflow)
                    } else {
                        this.advance()
                    }
                    break
                default:
                    throw new Error(`(AnimationManager.actorCallback) Unexpected ActorSignal: ${ActorMessage[message.message]}`)
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