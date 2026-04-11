import { Entity } from "../entity"
import { AnimationFrame, AnimationInterval, StaticKeyframeAnimation, KeyframeAnimationData } from "./static_keyframe_animation"
import { AnimationLayer } from "./layers"

const FADE_LENGTH = 200

export function makeFadeOut(entity: Entity) {
    const startWeight = entity.compositor.get(AnimationLayer.HOVER).weight
    const duration = startWeight * FADE_LENGTH

    function startFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, startWeight)
    }

    function endFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, 0)
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, startWeight * (1 - time / duration))
    }

    const keyframes: number[] = [0, duration]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, endFrame]
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new StaticKeyframeAnimation(animationData, entity, null, false)
}

export function makeFadeIn(entity: Entity) {
    const startWeight = entity.compositor.get(AnimationLayer.HOVER).weight
    const duration = (1 - startWeight) * FADE_LENGTH

    function startFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, startWeight)
    }

    function endFrame(target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, 1)
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        target.compositor.setWeight(AnimationLayer.HOVER, startWeight * (1 - time / duration) + time / duration)
    }

    const keyframes: number[] = [0, duration]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, endFrame]
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new StaticKeyframeAnimation(animationData, entity, null, false)
}