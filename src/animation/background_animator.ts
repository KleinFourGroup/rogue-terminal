import { Entity } from "../entity"
import { tileToPixel } from "../position"
import { TILE_SIZE } from "../text/canvas_style"
import { IBackgroundAnimation } from "./animation"
import { AnimationFrame, AnimationInterval, KeyframeAnimationData } from "./keyframe_animation"
import { KeyframeBackgroundAnimation } from "./keyframe_background_animation"

const HOVER_LENGTH = 2000
const HOVER_AMPLITUDE = 0.2

export enum BackgroundAnimation {
    HOVER
}

export function makeHover(entity: Entity) {
    const [baseX, baseY] = tileToPixel(0, 0, entity.width, entity.height)

    function startFrame(target: Entity, _data: null) {
        target.sprite.x = baseX
        target.sprite.y = baseY
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        const amplitude = (1 - Math.cos((time / HOVER_LENGTH) * 2 * Math.PI)) * HOVER_AMPLITUDE / 2
        target.sprite.x = baseX
        target.sprite.y = baseY - amplitude * TILE_SIZE
    }

    const keyframes: number[] = [0, HOVER_LENGTH]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, null!] // EWWW; refactor needed
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new KeyframeBackgroundAnimation(animationData, entity, null)
}

export function backgroundAnimator(entity: Entity, background: BackgroundAnimation): IBackgroundAnimation {
    switch (background) {
        case BackgroundAnimation.HOVER:
            return makeHover(entity)
        default:
            const exhaustivenessCheck: never = background
            throw new Error(`(backgroundAnimator) ${JSON.stringify(exhaustivenessCheck)}`)
    }
}