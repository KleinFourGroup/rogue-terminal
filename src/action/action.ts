import { Entity } from "../entity"
import { BasicActionDescription } from "./basic_action"

export interface IAction {
    entity: Entity
    tickLength: number

    act(): ActionDescription
}

// Probably will expand
export type ActionDescription = BasicActionDescription[]

export type ActionCallback<T> = (entity: Entity, actionData: T) => ActionDescription

export abstract class TurnAction<T> implements IAction {
    entity: Entity
    tickLength: number
    actionData: T
    actionCallback: ActionCallback<T>

    constructor(entity: Entity, actionData: T, tickLength: number, actionCallback: ActionCallback<T>) {
        this.entity = entity
        this.actionData = actionData
        this.tickLength = tickLength
        this.actionCallback = actionCallback
    }

    act() {
        return this.actionCallback(this.entity, this.actionData)
    }

}