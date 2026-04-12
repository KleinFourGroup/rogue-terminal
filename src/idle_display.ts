import { IAnimation } from "./animation/animation"
import { BackgroundAnimation, backgroundAnimator } from "./animation/background_animator"
import { makeFadeIn, makeFadeOut } from "./animation/fade"
import { Entity } from "./entity"
import { TurnDisplaySignals } from "./turn_display"
import { World } from "./world"

export class IdleDisplay {
    stateMap: Map<Entity, BackgroundAnimation>
    idleMap: Map<Entity, IAnimation>
    fadeMap: Map<Entity, IAnimation>
    suspended: Set<Entity>

    world: World

    constructor(world: World) {
        this.stateMap = new Map<Entity, BackgroundAnimation>()
        this.idleMap = new Map<Entity, IAnimation>()
        this.fadeMap = new Map<Entity, IAnimation>()
        this.suspended = new Set<Entity>()

        this.world = world
    }

    setupListeners(signals: TurnDisplaySignals) {
        signals.onActivate.subscribe((entity: Entity) => {this.suspend(entity)})
        signals.onIdle.subscribe((entity: Entity) => {this.resume(entity)})
    }

    setEntity(entity: Entity, state: BackgroundAnimation, randomize: boolean) {
        this.stateMap.set(entity, state)

        const animation = backgroundAnimator(entity, state)
        if (randomize) {
            animation.init(Math.random() * 1000)
        }
        this.idleMap.set(entity, animation)
    }

    suspend(entity: Entity) {
        if (this.stateMap.has(entity)) {
            const animation = makeFadeOut(entity)
            animation.init(0)
            this.fadeMap.set(entity, animation)
            this.suspended.add(entity)
        }
    }

    resume(entity: Entity) {
        if (this.stateMap.has(entity)) {
            const animation = makeFadeIn(entity)
            animation.init(0)
            this.fadeMap.set(entity, animation)
            this.suspended.delete(entity)
        }
    }

    isFaded(entity: Entity) {
        return this.suspended.has(entity) && !this.fadeMap.has(entity)
    }

    animateBackground(deltaMS: number) {
        const animated = new Set<Entity>()
        const finished = new Set<Entity>()

        for (const [entity, animation] of this.idleMap) {
            if (this.world.visibilityDisplay.isEntityVisible(entity) && !this.isFaded(entity)) {
                animation.animate(deltaMS)
                animated.add(entity)
            }
        }

        for (const [entity, animation] of this.fadeMap) {
            if (this.world.visibilityDisplay.isEntityVisible(entity)) {
                animation.animate(deltaMS)
            } else {
                animation.finish()
            }
            animated.add(entity)

            if (animation.isFinished()) {
                finished.add(entity)
            }
        }

        for (const entity of finished) {
            this.fadeMap.delete(entity)
        }

        return animated
    }
}