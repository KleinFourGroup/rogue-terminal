import { ActionStatus, IAction } from "./action"
import { Entity } from "./entity"
import { Component } from "./component"
import { SignalEmitter } from "./signal"
import { TileVisibility, VisibilityManager } from "./visibility/visibility_manager"
import { TilePosition } from "./position"
import { AnimatorSignal } from "./animation_manager"

export enum ActorSignal {
    ANIMATION_CONTINUE,
    ANIMATION_SKIP
}

export enum ActorStatus {
    IDLE,
    NOT_STARTED,
    AWAIT_ANIMATION,
    AWAIT_FINISH
}

export class Actor extends Component {
    declare entity: Entity
    currAction: IAction<any> | null
    actionCoolDown: number
    status: ActorStatus

    visibilityManager: VisibilityManager | null
    onAct: SignalEmitter<ActorSignal>

    constructor(entity: Entity) {
        super()
        this.setEntity(entity)
        this.currAction = null
        this.status = ActorStatus.IDLE
        this.visibilityManager = null
        this.onAct = new SignalEmitter<ActorSignal>
        this.actionCoolDown = 0
    }

    setVisibilityManager(visibilityManager: VisibilityManager) {
        this.visibilityManager = visibilityManager
    }

    setupListener(onStep: SignalEmitter<AnimatorSignal>) {
        const animationCallback = (message: AnimatorSignal) => {
            switch (message) {
                case AnimatorSignal.STEP:
                    if (this.status === ActorStatus.AWAIT_ANIMATION) {
                        this.advanceAction()
                    } else {
                        throw new Error(`(Actor.animationCallback) Recieved STEP message while in state ${this.status}`)
                    }
                    break
                case AnimatorSignal.FINISHED:
                    if (this.status !== ActorStatus.AWAIT_FINISH) {
                        throw new Error(`(Actor.animationCallback) Recieved FINISHED message while in state ${this.status}`)
                    }
                    break
                default:
                    throw new Error(`(Actor.animationCallback) Unexpected AnimatorSignal: ${message}`)
            }
        }

        onStep.subscribe(animationCallback)
    }

    isReady() {
        return this.status === ActorStatus.IDLE && this.actionCoolDown === 0
    }

    isIdle() {
        return this.status === ActorStatus.IDLE
    }

    isBlocking() {
        return this.status !== ActorStatus.IDLE && this.status !== ActorStatus.AWAIT_FINISH
    }

    doAction(action: IAction<any>) {
        this.setAction(action)
        if (this.status = ActorStatus.NOT_STARTED) {
            this.advanceAction()
        }
    }

    setAction(action: IAction<any>) {
        if (this.isReady()) {
            this.status = ActorStatus.NOT_STARTED
            this.currAction = action
        }
    }

    advanceAction() {
        console.assert(this.status !== ActorStatus.IDLE)

        function checkVisibility(footprint: TilePosition[], visibilityManager: VisibilityManager) {
            let visible = false

            for (const tile of footprint) {
                if (visibilityManager.getVisibility(tile.row, tile.col) === TileVisibility.VISIBLE) {
                    visible = true
                    break
                }
            }

            return visible
        }

        const result = this.currAction!.advance()

        switch (result.status) {
            case ActionStatus.ACTION_FINISHED:
                this.actionCoolDown = this.currAction!.tickLength
                this.currAction = null
                this.status = ActorStatus.AWAIT_FINISH
                this.onAct.emit(checkVisibility(result.footprint, this.visibilityManager!) ? ActorSignal.ANIMATION_CONTINUE : ActorSignal.ANIMATION_SKIP)
                break
            case ActionStatus.ACTION_PROCEED:
                this.status = ActorStatus.AWAIT_ANIMATION
                this.onAct.emit(checkVisibility(result.footprint, this.visibilityManager!) ? ActorSignal.ANIMATION_CONTINUE : ActorSignal.ANIMATION_SKIP)
                break
            default:
                throw new Error(`(Actor.advanceAction) Unexpected ActionStatus: ${result.status}`)
        }

        return result
    }

    advanceTicks(ticks: number = 1) {
        console.assert(this.status === ActorStatus.IDLE || this.status === ActorStatus.AWAIT_FINISH)
        this.actionCoolDown = Math.max(this.actionCoolDown - ticks, 0)
    }
}