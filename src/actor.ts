import { ActionStatus, IAction } from "./action/action"
import { Entity } from "./entity"
import { Component } from "./component"
import { SignalEmitter } from "./signal"
import { TilePositionSet } from "./position"
import { AnimatorSignal } from "./animation_manager"

export enum ActorMessage {
    ANIMATION_START,
    ANIMATION_CONTINUE,
}

export interface ActorSignal {
    message: ActorMessage
    footprint: TilePositionSet
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

    onAct: SignalEmitter<ActorSignal>

    constructor(entity: Entity) {
        super()
        this.setEntity(entity)
        this.currAction = null
        this.status = ActorStatus.IDLE
        this.onAct = new SignalEmitter<ActorSignal>
        this.actionCoolDown = 0
    }

    setupListener(onStep: SignalEmitter<AnimatorSignal>) {
        const animationCallback = (message: AnimatorSignal) => {
            console.log("Actor", this.entity!.id, "recieved message:", AnimatorSignal[message])
            switch (message) {
                case AnimatorSignal.STEP:
                    if (this.status === ActorStatus.AWAIT_ANIMATION) {
                        this.advanceAction()
                    } else {
                        throw new Error(`(Actor.animationCallback) Recieved STEP message while in state ${ActorStatus[this.status]}`)
                    }
                    break
                case AnimatorSignal.FINISHED:
                    if (this.status !== ActorStatus.AWAIT_FINISH) {
                        throw new Error(`(Actor.animationCallback) Recieved FINISHED message while in state ${ActorStatus[this.status]}`)
                    }
                    this.status = ActorStatus.IDLE
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
        return (this.status == ActorStatus.NOT_STARTED && this.currAction!.initialBlock) || (this.status === ActorStatus.AWAIT_ANIMATION)
    }

    doAction(action: IAction<any>) {
        this.setAction(action)
        if (this.status === ActorStatus.NOT_STARTED) {
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

        const result = this.currAction!.advance()

        if (this.status === ActorStatus.NOT_STARTED) {
            this.onAct.emit({message: ActorMessage.ANIMATION_START, footprint: new TilePositionSet()})
        }

        switch (result.status) {
            case ActionStatus.ACTION_FINISHED:
                this.actionCoolDown = this.currAction!.tickLength
                this.currAction = null
                this.status = ActorStatus.AWAIT_FINISH
                this.onAct.emit({message: ActorMessage.ANIMATION_CONTINUE, footprint: result.footprint})
                break
            case ActionStatus.ACTION_PROCEED:
                this.status = ActorStatus.AWAIT_ANIMATION
                this.onAct.emit({message: ActorMessage.ANIMATION_CONTINUE, footprint: result.footprint})
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