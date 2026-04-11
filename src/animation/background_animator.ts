import { Entity } from "../entity"
import { TILE_SIZE } from "../text/canvas_style"
import { IAnimation } from "./animation"
import { AnimationFrame, AnimationInterval, KeyframeAnimationData, StaticKeyframeAnimation } from "./static_keyframe_animation"
import { AnimationLayer } from "./layers"

const HOVER_LENGTH = 2000
const HOVER_AMPLITUDE = 0.2

export enum BackgroundAnimation {
    HOVER
}

export function makeHover(entity: Entity) {
    function startFrame(target: Entity, _data: null) {
        target.compositor.setVector(AnimationLayer.HOVER, 0, 0)
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        const amplitude = (1 - Math.cos((time / HOVER_LENGTH) * 2 * Math.PI)) * HOVER_AMPLITUDE / 2
        target.compositor.setVector(AnimationLayer.HOVER, 0, -amplitude * TILE_SIZE)
    }

    const keyframes: number[] = [0, HOVER_LENGTH]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, null!] // EWWW; refactor needed
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new StaticKeyframeAnimation(animationData, entity, null, true)
}

export function backgroundAnimator(entity: Entity, background: BackgroundAnimation): IAnimation {
    switch (background) {
        case BackgroundAnimation.HOVER:
            return makeHover(entity)
        default:
            const exhaustivenessCheck: never = background
            throw new Error(`(backgroundAnimator) ${JSON.stringify(exhaustivenessCheck)}`)
    }
}