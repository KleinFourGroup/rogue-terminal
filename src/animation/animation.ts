export interface IAnimation {
    elapsed: number

    init(deltaMS: number): void
    finish(): void
    animate(deltaMS: number): void

    isFinished(): boolean
}