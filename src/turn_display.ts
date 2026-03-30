import { ActionDescription } from "./action/action"
import { IAnimation } from "./animation/animation"
import { Entity } from "./entity"

export class TurnDisplay {
    activeMap: Map<Entity, IAnimation>
    queueMap: Map<Entity, ActionDescription>

    pending: {entity: Entity | null, turn: ActionDescription | null}
    blocking: {entity: Entity | null, turn: ActionDescription | null}

    constructor() {
        this.activeMap = new Map<Entity, IAnimation>()
        this.queueMap = new Map<Entity, ActionDescription>()

        this.pending = {entity: null, turn: null}
        this.blocking = {entity: null, turn: null}
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
            this.queueMap.set(this.pending.entity!, this.pending.turn!)
            // if ()
            this.pending.entity = null
            this.pending.turn = null
        }
    }
    
    updateQueue() {
        if (this.isPending()) {
            this.handlePend()
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