import { Entity } from "../entity"
import { BasicActionDescription } from "./basic_action"

export interface ITurnAction<T> {
    entity: Entity
    actionData: T

    tickLength: number

    resolve: BasicActionDescription[] | null
}