import { Entity } from "./entity";
import { TilePosition } from "./position";

export enum TurnTypes {
    IDLE,
    MOVE
}

export type TurnDescription = 
    {type: TurnTypes.IDLE, entity: Entity} |
    {type: TurnTypes.MOVE, entity: Entity, to: TilePosition, from: TilePosition}