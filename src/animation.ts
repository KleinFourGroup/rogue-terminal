import { Entity } from "./entity"

export type AnimationInterval<T> = (time: number, target: Entity, data: T) => void
export type AnimationFrame<T> = (target: Entity, data: T) => void

export type KeyframedAnimationData<T> = {
    keyframes: number[]
    frameAnimations: (AnimationFrame<T> | null)[]
    betweenAnimations: (AnimationInterval<T> | null)[]
}

interface IAnimation {
    elapsed: number
    duration: number
    loop: boolean

    init(deltaMS: number): void
    finish(): void
    animate(deltaMS: number): void

    isFinished(): boolean
}

