import { Entity } from "../entity"

export type AnimationInterval<T> = (time: number, target: Entity, data: T) => void
export type AnimationFrame<T> = (target: Entity, data: T) => void

export type KeyframedAnimationData<T> = {
    keyframes: number[]
    frameAnimations: (AnimationFrame<T> | null)[]
    betweenAnimations: (AnimationInterval<T> | null)[]
}

export enum AnimationStatus {
    ANIMATION_NOT_STARTED,
    ANIMATION_PROGRESS,
    ANIMATION_STEP,
    ANIMATION_FINISHED,
    ANIMATION_ERROR
}

export interface AnimationResult {
    status: AnimationStatus,
    overflow: number
}

export interface IAnimation {
    elapsed: number

    init(deltaMS: number): AnimationResult
    animate(deltaMS: number): AnimationResult
    advance(): AnimationResult
    finish(): AnimationResult

    currentStatus(): AnimationResult
}

