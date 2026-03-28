import { ECS } from "../ecs"
import { Entity } from "../entity"
import { TilePosition, TilePositionSet } from "../position"
import { ActionDescription, TurnAction } from "./action"
import { BasicAction } from "./basic_action"

export interface MoveOptions {
    cooldown: number
}

const DEFAULT_OPTIONS: MoveOptions = {
    cooldown: 1200
}

function moveCallback(entity: Entity, data: {ecs: ECS, destination: TilePosition, source: TilePosition}): ActionDescription {
    const oldFootprint = entity.footprint()
    let result = data.ecs.moveEntity(entity, data.destination.row, data.destination.col)
    return result ? [{
        turnType: BasicAction.MOVE,
        turnData: {
            actorEntity: entity,
            footprint: new TilePositionSet(oldFootprint, entity.footprint()),
            destination: data.destination,
            source: data.source
        }
    }] : []

}

export class MoveAction extends TurnAction<{ecs: ECS, destination: TilePosition, source: TilePosition}> {
    constructor(entity: Entity, ecs: ECS, destination: TilePosition, source: TilePosition, options: Partial<MoveOptions> = {}) {
        const fullOptions: MoveOptions = { ...DEFAULT_OPTIONS, ...options}

        super(entity, {ecs: ecs, destination: destination, source: source}, fullOptions.cooldown, moveCallback)
    }
}