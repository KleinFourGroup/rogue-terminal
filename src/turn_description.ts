import { Entity } from "./entity"
import { TilePosition, TilePositionSet } from "./position"

export enum TurnTypes {
    IDLE,
    MOVE
}

export interface ITurnData {
    actorEntity: Entity
    footprint: TilePositionSet
}

// TS dark magic

type TurnTypesCompletenessEnforcer<T extends Record<TurnTypes, ITurnData>> = T

type TurnTypeList = TurnTypesCompletenessEnforcer<{
    [TurnTypes.IDLE]: {actorEntity: Entity, footprint: TilePositionSet}
    [TurnTypes.MOVE]: {actorEntity: Entity, footprint: TilePositionSet, destination: TilePosition, source: TilePosition}
}>

export type TurnDescription = {
    [K in keyof TurnTypeList]: {turnType: K, turnData: TurnTypeList[K]}
}[keyof TurnTypeList]