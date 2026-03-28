import { ActionCallback, ActionResult, ActionStatus, IAction } from "./action"
import { Entity } from "../entity"

export interface ActionSequenceOptions<T> {
    abortStep: ActionCallback<T> | null
    blocking: boolean
}

const DEFAULT_OPTIONS: ActionSequenceOptions<any> = {
    abortStep: null,
    blocking: true
}

export class ActionSequence<T> implements IAction<T> {
    entity: Entity
    actionData: T
    initialBlock: boolean
    tickLength: number
    steps: ActionCallback<T>[]
    abortStep: ActionCallback<T> | null
    result: ActionResult
    currStep: number

    constructor(entity: Entity, actionData: T, tickLength: number, steps: ActionCallback<T>[], options: Partial<ActionSequenceOptions<T>> = {}) {
        const fullOptions = { ...DEFAULT_OPTIONS, ...options}

        this.entity = entity
        this.actionData = actionData
        this.initialBlock = fullOptions.blocking
        this.tickLength = tickLength
        this.steps = steps
        this.abortStep = fullOptions.abortStep
        this.result = {
            status: ActionStatus.ACTION_NOT_STARTED,
            footprint: this.entity.footprint()
        }
        this.currStep = 0
    }

    init() {
        if (this.result.status === ActionStatus.ACTION_NOT_STARTED) {
            return this.advance()
        }

        return this.result
    }

    advance() {
        if (this.result.status === ActionStatus.ACTION_FINISHED || this.result.status == ActionStatus.ACTION_FAILED) {
            return this.result
        }

        console.assert(this.currStep < this.steps.length)

        this.result = this.steps[this.currStep](this.entity, this.actionData)
        this.currStep++
        return this.result
    }

    finish() {
        while (this.result.status !== ActionStatus.ACTION_FINISHED && this.result.status !== ActionStatus.ACTION_FAILED) {
            this.advance()
        }

        return this.result
    }

    abort() {
        if (this.abortStep !== null) {
            this.result = this.abortStep(this.entity, this.actionData)
        }
        return this.result
    }

    currentStatus() {
        return this.result
    }
}