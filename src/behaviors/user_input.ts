import { Entity } from "../entity"
import { TilePosition } from "../position"

export enum UserInput {
    IDLE,
    MOVE
}

export interface IUserInputData {
    player: Entity
}

// TS dark magic

type UserInputCompletenessEnforcer<T extends Record<UserInput, IUserInputData>> = T

export type UserInputList = UserInputCompletenessEnforcer<{
    [UserInput.IDLE]: {player: Entity}
    [UserInput.MOVE]: {player: Entity, destination: TilePosition | null}
}>

export type UserInputDescription = {
    [K in keyof UserInputList]: {inputType: K, inputData: UserInputList[K]}
}[keyof UserInputList]