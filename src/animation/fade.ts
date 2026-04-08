import { Entity } from "../entity"
import { tileToPixel } from "../position"
import { AnimationFrame, AnimationInterval, KeyframeAnimation, KeyframeAnimationData } from "./keyframe_animation"

const FADE_LENGTH = 200

export function makeFade(entity: Entity) {
    const startX = entity.sprite.x
    const startY = entity.sprite.y
    const [endX, endY] = tileToPixel(0, 0, entity.width, entity.height)

    function startFrame(target: Entity, _data: null) {
        target.sprite.x = startX
        target.sprite.y = startY
    }

    function endFrame(target: Entity, _data: null) {
        target.sprite.x = endX
        target.sprite.y = endY
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        target.sprite.x = startX * (1 - time / FADE_LENGTH) + endX * time / FADE_LENGTH
        target.sprite.y = startY * (1 - time / FADE_LENGTH) + endY * time / FADE_LENGTH
    }

    const keyframes: number[] = [0, FADE_LENGTH]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, endFrame] // EWWW; refactor needed
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new KeyframeAnimation(animationData, entity, null)
}