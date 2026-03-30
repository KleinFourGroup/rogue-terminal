import { ActionDescription } from "./action/action"
import { BasicActionDescription } from "./action/basic_action"
import { IAnimation } from "./animation/animation"
import { basicActionAnimator, basicActionBlocker } from "./animation/basic_animator"
import { Entity } from "./entity"
import { TileVisibility, VisibilityManager } from "./visibility/visibility_manager"

function turnBlocks(turn: ActionDescription) {
    for (const basicAction of turn) {
        if (basicActionBlocker(basicAction)) {
            return true
        }
    }

    return false
}

function showAction(action: BasicActionDescription, visibilityManager: VisibilityManager | null) {
    if (visibilityManager !== null) {
        for (const tile of action.turnData.footprint) {
            if (visibilityManager.getVisibility(tile.row, tile.col) === TileVisibility.VISIBLE) {
                return true
            }
        }

        return false
    } else {
        // Be safe; just show everything
        return true
    }
}

export class TurnDisplay {
    activeMap: Map<Entity, IAnimation>
    queueMap: Map<Entity, ActionDescription>

    pending: {entity: Entity | null, turn: ActionDescription | null}
    blocking: {entity: Entity | null, turn: ActionDescription | null}

    visibilityManager: VisibilityManager | null

    constructor() {
        this.activeMap = new Map<Entity, IAnimation>()
        this.queueMap = new Map<Entity, ActionDescription>()

        this.pending = {entity: null, turn: null}
        this.blocking = {entity: null, turn: null}

        this.visibilityManager = null
    }

    setVisibility(visibilityManager: VisibilityManager) {
        this.visibilityManager = visibilityManager
    }

    isPending() {
        return this.pending.entity === null || this.pending.turn == null
    }

    isBlocking() {
        return this.blocking.entity === null || this.blocking.turn == null
    }

    isReady() {
        return !this.isPending() && !this.isBlocking()
    }

    getActive() {
        return [...this.activeMap.keys()]
    }
    
    enqueue(entity: Entity, turn: ActionDescription) {
        console.assert(this.isReady())

        this.pending.entity = entity
        this.pending.turn = turn
    }

    handlePend() {
        if (!this.queueMap.has(this.pending.entity!)) {
            if (!this.isBlocking()) {
                if (turnBlocks(this.pending.turn!)) {
                    this.blocking.entity = this.pending.entity
                    this.blocking.turn = this.pending.turn
                } else {
                    this.queueMap.set(this.pending.entity!, this.pending.turn!)
                }
                this.pending.entity = null
                this.pending.turn = null
            }
        }
    }

    handleBlock() {
        if (!this.queueMap.has(this.blocking.entity!) && this.queueMap.size === 0) {
            this.queueMap.set(this.blocking.entity!, this.blocking.turn!)
        }
    }
    
    updateQueue() {
        if (this.isPending()) {
            this.handlePend()
        }

        if (this.isBlocking()) {
            this.handleBlock()
        }

        const toDelete = []

        for (const [entity, turn] of this.queueMap) {
            while (turn.length > 0) {
                const basicAction = turn.shift()!
                const animation = basicActionAnimator(basicAction)
                if (showAction(basicAction, this.visibilityManager)) {
                    this.activeMap.set(entity, animation)
                    break
                } else {
                    animation.finish()
                }
            }
        }
    }

    animateActive(deltaMS: number) {
        const finished: Entity[] = []
        const animated = this.getActive()

        for (const [entity, animation] of this.activeMap) {
            animation.animate(deltaMS)
            if (animation.isFinished()) {
                finished.push(entity)
            }
        }

        for (const entity of finished) {
            this.activeMap.delete(entity)
        }

        return animated
    }
}