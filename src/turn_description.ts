import { Entity } from "./entity"
import { TilePosition } from "./position"

export enum TurnTypes {
    IDLE,
    MOVE
}

// TS dark magic

type TurnTypesCompletenessEnforcer<T extends Record<TurnTypes, unknown>> = T

type TurnTypeList = TurnTypesCompletenessEnforcer<{
    [TurnTypes.IDLE]: {entity: Entity}
    [TurnTypes.MOVE]: {entity: Entity, to: TilePosition, from: TilePosition}
}>

export type TurnDescription = {
    [K in keyof TurnTypeList]: {turnType: K, turnData: TurnTypeList[K]}
}[keyof TurnTypeList]