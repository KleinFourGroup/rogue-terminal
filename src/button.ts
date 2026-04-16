import { Container } from "pixi.js"
import { SignalEmitter } from "./signal"

export interface ButtonSignals {
    onHoverOver: SignalEmitter<Button>
    onHoverOut: SignalEmitter<Button>
    onTap: SignalEmitter<Button>
}

export abstract class Button extends Container {
    signals: ButtonSignals

    constructor() {
        super()

        this.signals = {
            onHoverOver: new SignalEmitter<Button>(),
            onHoverOut: new SignalEmitter<Button>(),
            onTap: new SignalEmitter<Button>()
        }

        this.eventMode = "dynamic"

        this.on("pointerover", (_event) => {
            this.onHoverOver()
            this.signals.onHoverOver.emit(this)
        })
        this.on("pointerout", (_event) => {
            this.onHoverOut()
            this.signals.onHoverOut.emit(this)
        })
        this.on("pointertap", (_event) => {
            this.onTap()
            this.signals.onHoverOut.emit(this)
        })
    }

    abstract onHoverOver(): void
    abstract onHoverOut(): void
    abstract onTap(): void
}