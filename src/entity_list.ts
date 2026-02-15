import { Container } from "pixi.js"
import { Entity } from "./entity"

// TODO: optimize--if every wall is an entity, then we want a better test than
// just iterating through a flat array.  Probably a quad tree?

export class EntityList {
    entities: Entity[]
    width: number
    height: number
    stage: Container

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        this.entities = []
        this.stage = new Container()
    }
    
    addEntity(entity: Entity) {
        if (this.entities.indexOf(entity) < 0) {
            this.entities.push(entity)
            this.stage.addChild(entity.sprite)
        }
    }

    removeEntity(entity: Entity) {
        const index = this.entities.indexOf(entity)
        if (index >= 0) {
            this.entities.splice(index, 1)
            this.stage.removeChild(entity.sprite)
        }
    }

    isFree(row: number, col: number) {
        // console.log("Testing: ", row, col)
        for (const entity of this.entities) {
            if (entity.tileCollision(row, col)) return false
        }

        return true
    }

    nextAI() {
        const hasAI = this.entities.filter((entity: Entity) => entity.hasAI)

        if (hasAI.length > 0) {
            return hasAI.reduce((currMin: Entity, entity: Entity) => entity.actor.actionCoolDown < currMin.actor.actionCoolDown ? entity : currMin, hasAI[0])
        }

        return null
    }

    advance(ticks: number) {
        console.log(`Skipping ahead ${ticks} ticks`)
        for (const entity of this.entities) {
            entity.actor.advance(ticks)
        }
    }
}