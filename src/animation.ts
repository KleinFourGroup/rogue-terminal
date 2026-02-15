import { Entity } from "./entity"
import { Scene } from "./scene"

export type AnimationInterval = (time: number, target: Entity, scene: Scene) => void
export type AnimationFrame = (target: Entity, scene: Scene) => void

export type KeyframedAnimationData = {
    keyframes: number[]
    frameAnimations: (AnimationFrame | null)[]
    betweenAnimations: (AnimationInterval | null)[]
}

export interface IAnimation {
    elapsed: number
    duration: number
    loop: boolean

    init(deltaMS: number): void
    finish(deltaMS: number): void
    animate(deltaMS: number): void

    isFinished(): boolean
}

export class KeyframedAnimation implements IAnimation {
    animation: KeyframedAnimationData
    target: Entity
    scene: Scene
    loop: boolean
    elapsed: number
    loopNum: number
    lastKeyframe: number

    constructor(animation: KeyframedAnimationData, target: Entity, scene: Scene, loop: boolean) {
        console.assert(animation.keyframes.length === animation.frameAnimations.length)
        console.assert(animation.keyframes.length === animation.betweenAnimations.length + 1)
        console.assert(animation.keyframes[0] === 0)
        if (loop) {
            console.assert(animation.frameAnimations[0] === null || animation.frameAnimations[animation.frameAnimations.length - 1] === null)
        }
        this.animation = animation
        this.target = target
        this.scene = scene
        this.loop = loop
        this.elapsed = 0.0
        this.loopNum = 0
        this.lastKeyframe = -1
    }

    get duration() {
        return this.animation.keyframes[this.animation.keyframes.length - 1]
    }

    isFinished() {
        return this.elapsed > this.duration && !this.loop
    }

    init(deltaMS: number = 0) {
        this.animate(deltaMS)
    }

    finish(deltaMS: number) {
        if (this.loop) {
            return
        }

        this.lastKeyframe++

        while (this.lastKeyframe < this.animation.keyframes.length) {
            // console.log(`Processing frame ${frameInd}`)
            if (this.animation.frameAnimations[this.lastKeyframe] !== null) {
                this.animation.frameAnimations[this.lastKeyframe]!(this.target, this.scene)
            }
            this.elapsed = this.duration
            this.lastKeyframe++
        }
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
                    this.animation.frameAnimations[frameInd]!(this.target, this.scene)
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
                    this.animation.betweenAnimations[this.lastKeyframe]!(overflow, this.target, this.scene)
                }
            }

            // We ran out of keyframes and we're looping
            if (this.loop && this.lastKeyframe === this.animation.keyframes.length - 1) {
                console.assert(this.elapsed >= this.duration)
                this.elapsed -= this.duration
                processedTime = 0
                if (this.animation.frameAnimations[0] !== null) {
                    this.animation.frameAnimations[0](this.target, this.scene)
                }
                this.lastKeyframe = 0
            }

            // console.log(`${processedTime} / ${this.elapsed}`)
        } while (this.loop && processedTime !== this.elapsed)
    }
}