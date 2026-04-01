import { SignalEmitter } from "../signal"

export enum TileVisibility {
    UNEXPLORED,
    HIDDEN,
    VISIBLE
}

export const VISIBILITIES = Object.values(TileVisibility).filter((val) => typeof val === "number")

export type TileVisibilitySignals = Record<TileVisibility, SignalEmitter<Set<number>>>