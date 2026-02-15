import { Action } from "./action"
import { AnimationFrame, AnimationInterval, KeyframedAnimation, KeyframedAnimationData } from "./animation"
import { Entity, tileToPixel } from "./entity"
import { Scene } from "./scene"

const MOVE_LENGTH = 1000

export function getSmoothMove(entity: Entity, row: number, col: number) {
    const oldX = entity.sprite.x
    const oldY = entity.sprite.y

    const [newX, newY] = tileToPixel(row, col, entity.width, entity.height)

    
    function startFrame(target: Entity, _scene: Scene) {
        target.sprite.x = oldX
        target.sprite.y = oldY
    }

    function endFrame(target: Entity, _scene: Scene) {
        target.sprite.x = newX
        target.sprite.y = newY
    }

    function betweenFrame(time: number, target: Entity, _scene: Scene) {
        let progress = (1 - Math.cos(Math.min(time / MOVE_LENGTH, 1) * Math.PI)) / 2
        target.sprite.x = oldX * (1 - progress) + newX * progress
        target.sprite.y = oldY * (1 - progress) + newY * progress
    }

    let keyframes: number[] = [0, MOVE_LENGTH]
    let frameAnimations: AnimationFrame[] = [startFrame, endFrame]
    let betweenAnimations: AnimationInterval[] = [betweenFrame]

    let animationData: KeyframedAnimationData = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    const animation = new KeyframedAnimation(animationData, entity, null!, false) // Look into these !s

    function moveCallback(entity: Entity, _scene: Scene) {
        entity.setPosition(row, col)
        return true
    }

    return new Action(moveCallback, animation, 1200, null)
}