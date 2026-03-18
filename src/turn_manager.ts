import { ActionStatus } from "./action/action"
import { ActorStatus } from "./actor"
import { Entity } from "./entity"

export enum TurnStatus {
    NO_TURN,
    START_TURN,
    WAIT_FOR_LAST_ANIMATION,
    RUN_AI,
    START_BLOCK,
    ACTION_INIT,
    LATE_BLOCK,
    ACTION_PROGRESS,
    // FINISH_BLOCK,
    FINISH_TURN
}

export class TurnManager {
    currentTurn: Entity | null
    blockingEntity: Entity | null
    status: TurnStatus
    outstanding: number

    constructor() {
        this.currentTurn = null
        this.blockingEntity = null
        this.status = TurnStatus.NO_TURN
        this.outstanding = 0
    }

    startTurn(entity: Entity) {
        console.assert(this.status === TurnStatus.NO_TURN)
        console.log("Starting turn for", entity.id)
        this.currentTurn = entity
        this.status = TurnStatus.START_TURN
    }

    checkLastAnimation() {
        console.assert(this.status === TurnStatus.START_TURN || this.status === TurnStatus.WAIT_FOR_LAST_ANIMATION)
        if (this.currentTurn!.animationManager.isActive()) {
            this.status = TurnStatus.WAIT_FOR_LAST_ANIMATION
        } else {
            this.status = TurnStatus.RUN_AI
        }
    }

    finishedAI() {
        console.assert(this.status === TurnStatus.RUN_AI)
        console.assert(!this.currentTurn!.actor.isIdle())

        if (this.currentTurn!.actor.isBlocking()) {
            this.status = TurnStatus.START_BLOCK
            this.blockingEntity = this.currentTurn
        } else {
            this.status = TurnStatus.ACTION_INIT
        }
    }

    setOutstandingAnimations(unfinished: number) {
        this.outstanding = unfinished
    }

    checkOutstandingAnimations() {
        console.assert(this.status === TurnStatus.START_BLOCK || this.status === TurnStatus.LATE_BLOCK)
        if (this.outstanding === 0) {
            this.status = (this.status === TurnStatus.START_BLOCK) ? TurnStatus.ACTION_INIT : TurnStatus.ACTION_PROGRESS
        }
    }

    initActionProgress(status: ActionStatus) {
        console.assert(this.status === TurnStatus.ACTION_INIT)
        if (status === ActionStatus.ACTION_FINISHED || status === ActionStatus.ACTION_FAILED) {
            if (this.blockingEntity !== null) {
                console.assert(this.blockingEntity === this.currentTurn)
            }
            this.status = TurnStatus.FINISH_TURN
        } else {
            this.blockingEntity = this.currentTurn
            this.status = TurnStatus.LATE_BLOCK
        }
    }

    updateActionProgress(status: ActorStatus) {
        console.assert(this.status === TurnStatus.ACTION_PROGRESS)
        if (status === ActorStatus.AWAIT_FINISH || status === ActorStatus.IDLE) {
            if (this.blockingEntity !== null) {
                console.assert(this.blockingEntity === this.currentTurn)
            }
            this.status = TurnStatus.FINISH_TURN
        }
    }

    finishTurn() {
        console.assert(this.status === TurnStatus.FINISH_TURN)
        console.log("Finishing turn for", this.currentTurn!.id)
        this.status = TurnStatus.NO_TURN
        this.currentTurn = null
        this.blockingEntity = null
    }
}