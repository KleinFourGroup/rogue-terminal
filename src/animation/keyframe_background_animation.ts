import { Entity } from "../entity"
import { IBackgroundAnimation } from "./animation"
import { KeyframeAnimationData } from "./keyframe_animation"

export class KeyframeBackgroundAnimation<T> implements IBackgroundAnimation {
    animation: KeyframeAnimationData<T>
    target: Entity
    animationData: T
    elapsed: number
    lastKeyframe: number

    constructor(animation: KeyframeAnimationData<T>, target: Entity, animationData: T) {
        console.assert(animation.keyframes.length === animation.frameAnimations.length)
        console.assert(animation.keyframes.length === animation.betweenAnimations.length + 1)
        console.assert(animation.keyframes[0] === 0)
        console.assert(animation.frameAnimations[0] === null || animation.frameAnimations[animation.frameAnimations.length - 1] === null)
        this.animation = animation
        this.target = target
        this.animationData = animationData
        this.elapsed = 0.0
        this.lastKeyframe = -1
    }

    get duration() {
        return this.animation.keyframes[this.animation.keyframes.length - 1]
    }

    init(deltaMS: number = 0) {
        this.animate(deltaMS)
    }

    reset(deltaMS: number = 0) {
        this.elapsed = 0.0
        this.lastKeyframe = -1
        this.animate(deltaMS)
    }

    animate(deltaMS: number) {
        let processedTime = this.elapsed
        this.elapsed += deltaMS

        do {
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

            // We ran out of keyframes and we're looping
            if (this.lastKeyframe === this.animation.keyframes.length - 1) {
                console.assert(this.elapsed >= this.duration)
                this.elapsed -= this.duration
                processedTime = 0
                if (this.animation.frameAnimations[0] !== null) {
                    this.animation.frameAnimations[0](this.target, this.animationData)
                }
                this.lastKeyframe = 0
            }

            // console.log(`${processedTime} / ${this.elapsed}`)
        } while (processedTime !== this.elapsed)
    }
}