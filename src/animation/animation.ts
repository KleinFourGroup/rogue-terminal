export interface IAnimation {
    elapsed: number

    init(deltaMS: number): void
    animate(deltaMS: number): void
    finish(): void
    isFinished(): boolean
    reset(deltaMS: number): void
}