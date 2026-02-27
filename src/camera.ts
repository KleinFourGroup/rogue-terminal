import { Container } from "pixi.js"
import { GameApp } from "./app"

export class Camera extends Container {
    app: GameApp
    stage: Container

    constructor(app: GameApp, stage: Container) {
        super()
        this.app = app
        this.stage = stage
    }

    setPosition(x: number, y: number) {
        this.stage.pivot.set(x, y)
    }

    setRotation(rotation: number) {
        this.stage.rotation = rotation
    }

    setScreenPosition(x: number, y: number) {
        this.stage.position.set(x, y)
    }

    setZoom(zoom: number) {
        this.stage.scale.set(zoom)
    }
}