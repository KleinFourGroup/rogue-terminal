import { Entity } from "../entity"
import { ActionDescription, TurnAction } from "./action"
import { BasicAction } from "./basic_action"

export interface IdleOptions {
    cooldown: number
}

const DEFAULT_OPTIONS: IdleOptions = {
    cooldown: 1200
}

function idleCallback(entity: Entity, _data: null): ActionDescription {
    return [{
        turnType: BasicAction.IDLE,
        turnData: {
            actorEntity: entity,
            footprint: entity.footprint()
        }
    }]

}

export class IdleAction extends TurnAction<null> {
    constructor(entity: Entity, options: Partial<IdleOptions> = {}) {
        const fullOptions: IdleOptions = { ...DEFAULT_OPTIONS, ...options}

        super(entity, null, fullOptions.cooldown, idleCallback)
    }
}