import { Entity } from "../entity"
import { TilePosition, TilePositionSet } from "../position"

export enum BasicAction {
    IDLE,
    MOVE
}

export interface IBasicActionData {
    actorEntity: Entity
    footprint: TilePositionSet
}

// TS dark magic

type BasicActionsCompletenessEnforcer<T extends Record<BasicAction, IBasicActionData>> = T

export type BasicActionList = BasicActionsCompletenessEnforcer<{
    [BasicAction.IDLE]: {actorEntity: Entity, footprint: TilePositionSet}
    [BasicAction.MOVE]: {actorEntity: Entity, footprint: TilePositionSet, destination: TilePosition, source: TilePosition}
}>

export type BasicActionDescription = {
    [K in keyof BasicActionList]: {turnType: K, turnData: BasicActionList[K]}
}[keyof BasicActionList]