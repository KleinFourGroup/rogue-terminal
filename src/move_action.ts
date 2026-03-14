import { ActionStatus, InstantAction } from "./action"
import { AnimationFrame, AnimationInterval, KeyframedAnimation, KeyframedAnimationData } from "./animation"
import { ECS } from "./ecs"
import { Entity } from "./entity"
import { tileToPixel } from "./position"
import { Scene } from "./scene"

const MOVE_LENGTH = 500

export interface MoveOptions {
    blocking: boolean
    duration: number
    cooldown: number
}

const DEFAULT_OPTIONS: MoveOptions = {
    blocking: false,
    duration: MOVE_LENGTH,
    cooldown: 1200
}

export function getSmoothMove(entity: Entity, ecs: ECS, row: number, col: number, options: Partial<MoveOptions> = {}) {
    const fullOptions: MoveOptions = { ...DEFAULT_OPTIONS, ...options}
    
    const oldX = entity.sprite.x
    const oldY = entity.sprite.y

    const [newX, newY] = tileToPixel(row, col, entity.width, entity.height)

    
    function startFrame(target: Entity, _scene: Scene | null) {
        target.sprite.x = oldX
        target.sprite.y = oldY
    }

    function endFrame(target: Entity, _scene: Scene | null) {
        target.sprite.x = newX
        target.sprite.y = newY
    }

    function betweenFrame(time: number, target: Entity, _scene: Scene | null) {
        let progress = (1 - Math.cos(Math.min(time / fullOptions.duration, 1) * Math.PI)) / 2
        target.sprite.x = oldX * (1 - progress) + newX * progress
        target.sprite.y = oldY * (1 - progress) + newY * progress
    }

    let keyframes: number[] = [0, fullOptions.duration]
    let frameAnimations: AnimationFrame<Scene | null>[] = [startFrame, endFrame]
    let betweenAnimations: AnimationInterval<Scene | null>[] = [betweenFrame]

    let animationData: KeyframedAnimationData<Scene | null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    const animation = new KeyframedAnimation(animationData, entity, null!, false) // Look into these !s

    function moveCallback(entity: Entity, _scene: Scene | null) {
        let result = ecs.moveEntity(entity, row, col)
        return {status: result ? ActionStatus.ACTION_FINISHED : ActionStatus.ACTION_FAILED, footprint: entity.footprint()}
    }

    return new InstantAction<Scene | null>(entity, moveCallback, animation, fullOptions.cooldown, fullOptions.blocking, null)
}