import { ActionStatus } from "./action"
import { AnimationFrame, AnimationInterval } from "./animation"
import { KeyframeAnimation, KeyframeAnimationData } from "./keyframe_animation"
import { Entity } from "./entity"
import { Scene } from "./scene"
import { InstantAction } from "./instant_action"

const IDLE_LENGTH = 500

export function getIdle(entity: Entity, blocking: boolean = false) {
    function startFrame(_target: Entity, _scene: Scene | null) {}

    function endFrame(_target: Entity, _scene: Scene | null) {}

    function betweenFrame(_time: number, _target: Entity, _scene: Scene | null) {}

    let keyframes: number[] = [0, IDLE_LENGTH]
    let frameAnimations: AnimationFrame<Scene | null>[] = [startFrame, endFrame]
    let betweenAnimations: AnimationInterval<Scene | null>[] = [betweenFrame]

    let animationData: KeyframeAnimationData<Scene | null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    const animation = new KeyframeAnimation<Scene | null>(entity, null, animationData) // Look into these !s

    function idleCallback(_entity: Entity, _scene: Scene | null) {
        return {status: ActionStatus.ACTION_FINISHED, footprint: entity.footprint()}
    }

    const action = new InstantAction<Scene | null>(entity, null, 1200, idleCallback, {blocking: blocking})

    return [action, animation] as const
}