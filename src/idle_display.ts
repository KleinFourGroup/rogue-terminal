import { IBackgroundAnimation } from "./animation/animation"
import { BackgroundAnimation, backgroundAnimator } from "./animation/background_animator"
import { Entity } from "./entity"
import { TurnDisplaySignals } from "./turn_display"
import { World } from "./world"

export class IdleDisplay {
    stateMap: Map<Entity, BackgroundAnimation>
    animations: Map<Entity, IBackgroundAnimation>
    suspended: Set<Entity>

    world: World

    constructor(world: World) {
        this.stateMap = new Map<Entity, BackgroundAnimation>()
        this.animations = new Map<Entity, IBackgroundAnimation>()
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
        this.animations.set(entity, animation)
    }

    suspend(entity: Entity) {
        if (this.stateMap.has(entity)) {
            this.suspended.add(entity)
        }
    }

    resume(entity: Entity) {
        this.suspended.delete(entity)

        if (this.animations.has(entity)) {
            this.animations.get(entity)!.reset(0)
        }
    }

    animateBackground(deltaMS: number) {
        const animated = new Set<Entity>()

        for (const [entity, animation] of this.animations) {
            if (this.world.visibilityDisplay.isEntityVisible(entity) && !this.suspended.has(entity)) {
                animation.animate(deltaMS)
                animated.add(entity)
            }
        }

        return animated
    }
}