import { Actor } from "./actor"
import { AnimationManager } from "./animation_manager"
import { Entity } from "./entity"
import { VisibilityManager } from "./visibility/visibility_manager"

export function makeActor(entity: Entity, visibilityManager: VisibilityManager) {
    const actor = new Actor(entity)
    const animationManager = new AnimationManager(entity)

    animationManager.setVisibilityManager(visibilityManager)
    
    actor.setupListener(animationManager.onStep)
    animationManager.setupListener(actor.onAct)

    entity.addComponent(actor)
    entity.addComponent(animationManager)
}