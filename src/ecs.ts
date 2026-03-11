import { Entity } from "./entity"
import { World } from "./world"
import { AILogic } from "./behaviors/behavior"
import { EntityGrid } from "./entity_grid"

export class ECS extends EntityGrid<Entity> {
    world: World | null

    constructor(rows: number, cols: number) {
        super(rows, cols)
        this.world = null
    }

    setWorld(world: World | null) {
        if (world !== null) {
            console.assert(world.rows === this.rows && world.cols === this.cols)
        }
        
        this.world = world
    }

    getActive() {
        return this.entities.filter((entity: Entity) => entity.animationManager.isActive())
    }

    nextAI() {
        const hasAI = this.entities.filter((entity: Entity) => entity.getComponent(AILogic) !== null)

        if (hasAI.length > 0) {
            return hasAI.reduce((currMin: Entity, entity: Entity) => entity.actor.actionCoolDown < currMin.actor.actionCoolDown ? entity : currMin, hasAI[0])
        }

        return null
    }

    advanceTicks(ticks: number) {
        console.log(`Skipping ahead ${ticks} ticks`)
        for (const entity of this.entities) {
            entity.actor.advanceTicks(ticks)
        }
    }
}