import { IAnimation, IBackgroundAnimation } from "./animation/animation"
import { BackgroundAnimation, backgroundAnimator } from "./animation/background_animator"
import { makeFade } from "./animation/fade"
import { Entity } from "./entity"
import { TurnDisplaySignals } from "./turn_display"
import { World } from "./world"

export class IdleDisplay {
    stateMap: Map<Entity, BackgroundAnimation>
    idleMap: Map<Entity, IBackgroundAnimation>
    fadeMap: Map<Entity, IAnimation>
    suspended: Set<Entity>

    world: World

    constructor(world: World) {
        this.stateMap = new Map<Entity, BackgroundAnimation>()
        this.idleMap = new Map<Entity, IBackgroundAnimation>()
        this.fadeMap = new Map<Entity, IAnimation>()
        this.suspended = new Set<Entity>()

        this.world = world
    }

    setupListeners(signals: TurnDisplaySignals) {
        signals.onActivate.subscribe((entity: Entity) => {this.suspend(entity)})
        signals.onIdle.subscribe((entity: Entity) => {this.resume(entity)})
    }

    setEntity(entity: Entity, state: BackgroundAnimation) {
        this.stateMap.set(entity, state)

        const animation = backgroundAnimator(entity, state)
        this.idleMap.set(entity, animation)
    }

    suspend(entity: Entity) {
        if (this.stateMap.has(entity)) {
            this.suspended.add(entity)
            const animation = makeFade(entity)
            animation.init(0)
            this.fadeMap.set(entity, animation)
        }
    }

    resume(entity: Entity) {
        this.suspended.delete(entity)

        if (this.fadeMap.has(entity)) {
            this.fadeMap.get(entity)!.finish()
            this.fadeMap.delete(entity)
        }

        if (this.idleMap.has(entity)) {
            this.idleMap.get(entity)!.reset(0)
        }
    }

    animateBackground(deltaMS: number) {
        const animated = new Set<Entity>()
        const finished = new Set<Entity>()

        for (const [entity, animation] of this.idleMap) {
            if (this.world.visibilityDisplay.isEntityVisible(entity) && !this.suspended.has(entity)) {
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