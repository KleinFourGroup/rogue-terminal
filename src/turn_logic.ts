import { Actor } from "./actor"
import { AILogic } from "./behaviors/behavior"
import { Entity } from "./entity"
import { World } from "./world"

export class TurnLogic {
    world: World
    currEntity: Entity | null

    constructor(world: World) {
        this.world = world
        this.currEntity = null
    }

    advanceTurn() {
        this.currEntity = this.world.nextAI()
        if (this.currEntity !== null) {
            const toSkip = this.currEntity.getComponent(Actor)!.actionCoolDown
            this.world.advanceTicks(toSkip)
        }
    }

    resolve() {
        if (this.currEntity !== null) {
                const action = this.currEntity.getComponent(AILogic)!.getAction()
                const description = this.currEntity.getComponent(Actor)!.doAction(action)
                return description
        }

        return null
    }
}