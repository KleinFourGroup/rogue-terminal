import { InstantAction } from "./action"
import { AnimationFrame, AnimationInterval, KeyframedAnimation, KeyframedAnimationData } from "./animation"
import { Entity } from "./entity"
import { Scene } from "./scene"

const IDLE_LENGTH = 500

export function getIdle(entity: Entity, blocking: boolean = false) {
    function startFrame(_target: Entity, _scene: Scene) {}

    function endFrame(_target: Entity, _scene: Scene) {}

    function betweenFrame(_time: number, _target: Entity, _scene: Scene) {}

    let keyframes: number[] = [0, IDLE_LENGTH]
    let frameAnimations: AnimationFrame[] = [startFrame, endFrame]
    let betweenAnimations: AnimationInterval[] = [betweenFrame]

    let animationData: KeyframedAnimationData = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    const animation = new KeyframedAnimation(animationData, entity, null!, false) // Look into these !s

    function idleCallback(_entity: Entity, _scene: Scene | null) {
        return true
    }

    return new InstantAction(entity, idleCallback, animation, 1200, blocking, null)
}