import { Entity } from "../entity"
import { AnimationFrame, AnimationInterval, KeyframeAnimation, KeyframeAnimationData } from "./keyframe_animation"
import { AnimationLayer } from "./layers"

const FADE_LENGTH = 200

export function makeFadeIn(entity: Entity) {
    function startFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, 1)
    }

    function endFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, 0)
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, 1 - time / FADE_LENGTH)
    }

    const keyframes: number[] = [0, FADE_LENGTH]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, endFrame]
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new KeyframeAnimation(animationData, entity, null)
}

export function makeFadeOut(entity: Entity) {
    function startFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, 0)
    }

    function endFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, 1)
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, time / FADE_LENGTH)
    }

    const keyframes: number[] = [0, FADE_LENGTH]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, endFrame]
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new KeyframeAnimation(animationData, entity, null)
}