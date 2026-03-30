import { BasicAction, BasicActionDescription, BasicActionList } from "../action/basic_action"
import { Entity } from "../entity"
import { tileToPixel } from "../position"
import { Observer } from "../visibility/observer"
import { IAnimation } from "./animation"
import { AnimationFrame, AnimationInterval, KeyframeAnimation, KeyframeAnimationData } from "./keyframe_animation"

const IDLE_LENGTH = 500
const MOVE_LENGTH = 500

function makeIdle(turnData: BasicActionList[BasicAction.IDLE]) {
    function startFrame(_target: Entity, _data: null) {}

    function endFrame(_target: Entity, _data: null) {}

    function betweenFrame(_time: number, _target: Entity, _data: null) {}
    
    const keyframes: number[] = [0, IDLE_LENGTH]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, endFrame]
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new KeyframeAnimation<null>(animationData, turnData.actorEntity, null)
}

function makeMove(turnData: BasicActionList[BasicAction.MOVE]) {
    const [oldX, oldY] = tileToPixel(turnData.source.row, turnData.source.col, turnData.actorEntity.width, turnData.actorEntity.height)
    const [newX, newY] = tileToPixel(turnData.destination.row, turnData.destination.col, turnData.actorEntity.width, turnData.actorEntity.height)
    
    function startFrame(target: Entity, _data: null) {
        target.sprite.x = oldX
        target.sprite.y = oldY
    }

    function endFrame(target: Entity, _data: null) {
        target.sprite.x = newX
        target.sprite.y = newY
    }

    function betweenFrame(time: number, target: Entity, _data: null) {
        const progress = (1 - Math.cos(Math.min(time / MOVE_LENGTH, 1) * Math.PI)) / 2
        target.sprite.x = oldX * (1 - progress) + newX * progress
        target.sprite.y = oldY * (1 - progress) + newY * progress
    }

    const keyframes: number[] = [0, MOVE_LENGTH]
    const frameAnimations: AnimationFrame<null>[] = [startFrame, endFrame]
    const betweenAnimations: AnimationInterval<null>[] = [betweenFrame]

    const animationData: KeyframeAnimationData<null> = {
        keyframes: keyframes,
        frameAnimations: frameAnimations,
        betweenAnimations: betweenAnimations
    }

    return new KeyframeAnimation(animationData, turnData.actorEntity, null)
}

export function basicActionAnimator(action: BasicActionDescription): IAnimation {
    switch (action.turnType) {
        case BasicAction.IDLE:
            return makeIdle(action.turnData)
        case BasicAction.MOVE:
            return makeMove(action.turnData)
        default:
            const exhaustivenessCheck: never = action
            throw new Error(`(basicActionAnimator) ${JSON.stringify(exhaustivenessCheck)}`)
    }
}

export function basicActionBlocker(action: BasicActionDescription): boolean {
    switch (action.turnType) {
        case BasicAction.IDLE:
            return action.turnData.actorEntity.hasComponent(Observer) // Place-holder
        case BasicAction.MOVE:
            return action.turnData.actorEntity.hasComponent(Observer) // Place-holder
        default:
            const exhaustivenessCheck: never = action
            throw new Error(`(basicActionBlocker) ${JSON.stringify(exhaustivenessCheck)}`)
    }
}