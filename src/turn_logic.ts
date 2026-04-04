import { Actor } from "./actor"
import { AILogic } from "./behaviors/behavior"
import { Entity } from "./entity"
import { Observer } from "./visibility/observer"
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

        return this.currEntity
    }

    resolve() {
        if (this.currEntity !== null) {
                const action = this.currEntity.getComponent(AILogic)!.getAction()

                if (action === null) {
                    return null
                }
                
                const description = this.currEntity.getComponent(Actor)!.doAction(action)

                if (this.currEntity.hasComponent(Observer)) {
                    this.world.calculateView()
                }
                return description
        }

        return null
    }
}