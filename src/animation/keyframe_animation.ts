import { AnimationFrame, AnimationInterval, AnimationResult, AnimationStatus, IAnimation } from "./animation"
import { Entity } from "../entity"

export type KeyframeAnimationData<T> = {
    keyframes: number[]
    frameAnimations: AnimationFrame<T>[]
    betweenAnimations: AnimationInterval<T>[]
}

export class KeyframeAnimation<T> implements IAnimation {
    target: Entity
    animationData: T
    animation: KeyframeAnimationData<T>

    elapsed: number
    result: AnimationResult

    keyframe: number

    constructor( target: Entity, animationData: T, animation: KeyframeAnimationData<T>) {
        console.assert(animation.keyframes.length === animation.frameAnimations.length)
        console.assert(animation.keyframes.length === animation.betweenAnimations.length + 1)
        console.assert(animation.keyframes[0] === 0)
        this.target = target
        this.animationData = animationData
        this.animation = animation

        this.elapsed = 0.0

        this.result = {
            status: AnimationStatus.ANIMATION_NOT_STARTED,
            overflow: 0
        }
        this.keyframe = 0
    }

    get duration() {
        return this.animation.keyframes[this.animation.keyframes.length - 1]
    }

    init(deltaMS: number = 0) {
        if (this.result.status !== AnimationStatus.ANIMATION_NOT_STARTED) {
            return this.result
        }

        return this.animate(deltaMS)
    }

    animate(deltaMS: number) {
        const elapsedTarget = this.elapsed + deltaMS

        if (this.result.status === AnimationStatus.ANIMATION_FINISHED || this.result.status === AnimationStatus.ANIMATION_ERROR) {
            return this.result
        }

        console.assert(this.keyframe < this.animation.keyframes.length)

        if (this.animation.keyframes[this.keyframe] <= elapsedTarget) {
            this.animation.frameAnimations[this.keyframe](this.target, this.animationData)
            this.elapsed = this.animation.keyframes[this.keyframe]
            this.result = {
                status: (this.keyframe === this.animation.keyframes.length - 1) ? AnimationStatus.ANIMATION_FINISHED : AnimationStatus.ANIMATION_STEP,
                overflow: elapsedTarget - this.elapsed
            }
            this.keyframe++
            return this.result
        }

        if (this.elapsed < elapsedTarget) {
            console.assert(this.keyframe > 0)
            this.elapsed = elapsedTarget
            this.animation.betweenAnimations[this.keyframe - 1](deltaMS, this.target, this.animationData)
        }

        this.result = {
            status: AnimationStatus.ANIMATION_PROGRESS,
            overflow: 0
        }

        return this.result
    }


    advance() {
        if (this.result.status === AnimationStatus.ANIMATION_FINISHED || this.result.status === AnimationStatus.ANIMATION_ERROR) {
            return this.result
        }

        console.assert(this.keyframe < this.animation.keyframes.length)

        this.animation.frameAnimations[this.keyframe](this.target, this.animationData)
        this.elapsed = this.animation.keyframes[this.keyframe]
        this.result = {
            status: (this.keyframe === this.animation.keyframes.length - 1) ? AnimationStatus.ANIMATION_FINISHED : AnimationStatus.ANIMATION_STEP,
            overflow: 0
        }
        this.keyframe++
        return this.result
    }

    finish() {
        while (this.result.status !== AnimationStatus.ANIMATION_FINISHED && this.result.status !== AnimationStatus.ANIMATION_ERROR) {
            this.advance()
        }

        return this.result
    }

    currentStatus() {
        return this.result
    }
}
