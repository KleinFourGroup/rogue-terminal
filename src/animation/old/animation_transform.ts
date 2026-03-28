import { AnimationResult, AnimationStatus, IAnimation } from "./animation"

export class EmptyAnimation implements IAnimation {
    elapsed: number
    status: AnimationStatus

    constructor() {
        this.elapsed = 0
        this.status = AnimationStatus.ANIMATION_NOT_STARTED
    }

    init(deltaMS: number) {
        if (this.status !== AnimationStatus.ANIMATION_NOT_STARTED) {
            return {status: this.status, overflow: 0}
        }

        return this.animate(deltaMS)
    }
    
    animate(deltaMS: number) {
        switch (this.status) {
            case AnimationStatus.ANIMATION_NOT_STARTED:
                this.status = AnimationStatus.ANIMATION_STEP
                return {status: this.status, overflow: deltaMS}
            case AnimationStatus.ANIMATION_STEP:
                this.status = AnimationStatus.ANIMATION_FINISHED
                return {status: this.status, overflow: deltaMS}
            default:
                return {status: this.status, overflow: 0}
        }
    }

    advance() {
        return this.animate(0)
    }

    finish() {
        this.status = AnimationStatus.ANIMATION_FINISHED
        return {status: this.status, overflow: 0}
    }

    currentStatus() {
        return {status: this.status, overflow: 0}
    }

}

export class AnimationSequence implements IAnimation {
    animations: IAnimation[]
    current: number

    result: AnimationResult

    constructor(...animations: IAnimation[]) {
        if (animations.length === 0) {
            animations = [new EmptyAnimation()]
        }

        this.animations = animations
        this.current = 0

        this.result = {
            status: AnimationStatus.ANIMATION_NOT_STARTED,
            overflow: 0
        }
    }

    get elapsed() {
        let sum = 0

        for (let index = 0; index <= this.current; index++) {
            sum += this.animations[index].elapsed
        }

        return sum
    }

    init(deltaMS: number) {
        if (this.result.status !== AnimationStatus.ANIMATION_NOT_STARTED) {
            return this.result
        }

        return this.animate(deltaMS)
    }

    animate(deltaMS: number) {
        if (this.current >= this.animations.length) {
            return this.result
        }

        let result = this.animations[this.current].animate(deltaMS)

        if (result.status === AnimationStatus.ANIMATION_FINISHED && this.current < this.animations.length - 1) {
            this.current++
            result = this.animations[this.current].init(result.overflow)
        }

        this.result = result
        return result
    }

    advance() {
        if (this.current >= this.animations.length) {
            return this.result
        }

        let result = this.animations[this.current].advance()

        if (result.status === AnimationStatus.ANIMATION_FINISHED && this.current < this.animations.length - 1) {
            this.current++
            result = this.animations[this.current].init(0)
        }

        this.result = result
        return result
    }

    finish() {
        if (this.current >= this.animations.length) {
            return this.result
        }

        for (let index = this.current; index < this.animations.length; index++) {
            this.result = this.animations[index].finish()
            if (this.result.status !== AnimationStatus.ANIMATION_FINISHED) {
                break
            }
        }

        return this.result
    }

    currentStatus() {
        return this.result
    }
}