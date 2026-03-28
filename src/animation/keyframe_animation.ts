import { Entity } from "../entity"
import { IAnimation } from "./animation"

export type AnimationInterval<T> = (time: number, target: Entity, data: T) => void
export type AnimationFrame<T> = (target: Entity, data: T) => void

export type KeyframeAnimationData<T> = {
    keyframes: number[]
    frameAnimations: AnimationFrame<T>[]
    betweenAnimations: AnimationInterval<T>[]
}

export class KeyframeAnimation<T> implements IAnimation {
    animation: KeyframeAnimationData<T>
    target: Entity
    animationData: T
    elapsed: number
    loopNum: number
    lastKeyframe: number

    constructor(animation: KeyframeAnimationData<T>, target: Entity, animationData: T) {
        console.assert(animation.keyframes.length === animation.frameAnimations.length)
        console.assert(animation.keyframes.length === animation.betweenAnimations.length + 1)
        console.assert(animation.keyframes[0] === 0)
        this.animation = animation
        this.target = target
        this.animationData = animationData
        this.elapsed = 0.0
        this.loopNum = 0
        this.lastKeyframe = -1
    }

    get duration() {
        return this.animation.keyframes[this.animation.keyframes.length - 1]
    }

    isFinished() {
        return this.elapsed > this.duration
    }

    init(deltaMS: number = 0) {
        this.animate(deltaMS)
    }

    finish() {
        this.lastKeyframe++

        while (this.lastKeyframe < this.animation.keyframes.length) {
            // console.log(`Processing frame ${frameInd}`)
            if (this.animation.frameAnimations[this.lastKeyframe] !== null) {
                this.animation.frameAnimations[this.lastKeyframe]!(this.target, this.animationData)
            }
            this.elapsed = this.duration
            this.lastKeyframe++
        }
    }

    animate(deltaMS: number) {
        let processedTime = this.elapsed
        this.elapsed += deltaMS

        let frameInd = this.lastKeyframe + 1

        // Walk through keyframes from next one until either end or we go past elapsed
        while (frameInd < this.animation.keyframes.length && this.animation.keyframes[frameInd] <= this.elapsed) {
            // console.log(`Processing frame ${frameInd}`)
            if (this.animation.frameAnimations[frameInd] !== null) {
                this.animation.frameAnimations[frameInd]!(this.target, this.animationData)
            }
            processedTime = this.animation.keyframes[frameInd]
            this.lastKeyframe = frameInd
            frameInd++
        }

        // We aren't done and we had more frames left
        if (processedTime < this.elapsed && this.lastKeyframe < this.animation.keyframes.length - 1) {
            // console.log(`Processing between frames ${this.lastKeyframe}-${this.lastKeyframe + 1}`)
            let overflow = this.elapsed - this.animation.keyframes[this.lastKeyframe]
            processedTime = this.elapsed
            if (this.animation.betweenAnimations[this.lastKeyframe] !== null) {
                this.animation.betweenAnimations[this.lastKeyframe]!(overflow, this.target, this.animationData)
            }
        }

        // console.log(`${processedTime} / ${this.elapsed}`)
    }
}