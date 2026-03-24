import { Entity } from "../entity"
import { TilePosition, TilePositionSet } from "../position"

export enum BasicActions {
    IDLE,
    MOVE
}

export interface IBasicActionData {
    actorEntity: Entity
    footprint: TilePositionSet
}

// TS dark magic

type BasicActionsCompletenessEnforcer<T extends Record<BasicActions, IBasicActionData>> = T

type BasicActionList = BasicActionsCompletenessEnforcer<{
    [BasicActions.IDLE]: {actorEntity: Entity, footprint: TilePositionSet}
    [BasicActions.MOVE]: {actorEntity: Entity, footprint: TilePositionSet, destination: TilePosition, source: TilePosition}
}>

export type BasicActionDescription = {
    [K in keyof BasicActionList]: {turnType: K, turnData: BasicActionList[K]}
}[keyof BasicActionList]