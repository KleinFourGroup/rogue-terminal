export interface IBasicAnimation {
    elapsed: number

    init(deltaMS: number): void
    animate(deltaMS: number): void
}

export interface IAnimation extends IBasicAnimation {
    finish(): void
    isFinished(): boolean
}

export interface IBackgroundAnimation extends IBasicAnimation {
    reset(deltaMS: number): void
}