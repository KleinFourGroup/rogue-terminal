import { Container } from "pixi.js"
import { GameApp } from "./app"
import { SignalEmitter } from "./signal"

interface CameraState {
    x: number,
    y: number,
    zoom: number
}

interface CameraSignals {
    onMove: SignalEmitter<CameraState>
    onZoom: SignalEmitter<CameraState>
}

export class Camera extends Container {
    app: GameApp
    stage: Container

    state: CameraState
    signals: CameraSignals

    constructor(app: GameApp, stage: Container) {
        super()
        this.app = app
        this.stage = stage

        this.state = {
            x: this.stage.pivot.x,
            y: this.stage.pivot.y,
            zoom: this.stage.scale.x
        }

        this.signals = {
            onMove: new SignalEmitter<CameraState>(),
            onZoom: new SignalEmitter<CameraState>()
        }
    }

    setPosition(x: number, y: number) {
        if (x !== this.state.x || y !== this.state.y) {
            this.stage.pivot.set(x, y)
            this.state.x = x
            this.state.y = y
            this.signals.onMove.emit(this.state)
        }
    }

    setRotation(rotation: number) {
        this.stage.rotation = rotation
    }

    setScreenPosition(x: number, y: number) {
        this.stage.position.set(x, y)
    }

    setZoom(zoom: number) {
        if (zoom !== this.state.zoom) {
            this.stage.scale.set(zoom)
            this.state.zoom = zoom
            this.signals.onZoom.emit(this.state)
        }
    }
}