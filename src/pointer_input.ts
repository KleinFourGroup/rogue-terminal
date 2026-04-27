import { Container, FederatedPointerEvent, Graphics, Point } from "pixi.js"
import { GameApp } from "./app"
import { SignalEmitter } from "./signal"
import { Camera, CameraSignals, CameraState } from "./camera"
import { Button } from "./button"

export class PointerInput {
    app: GameApp
    inputContainer: Container
    camera: Camera

    pointer: Point | null

    onUpdate: SignalEmitter<Point | null>
    onClick: SignalEmitter<Point>

    constructor(app: GameApp, camera: Camera) {
        this.app = app
        this.inputContainer = new Container()
        this.camera = camera

        this.pointer = null

        this.onUpdate = new SignalEmitter<Point | null>()
        this.onClick = new SignalEmitter<Point>()

        this.inputContainer.eventMode = "dynamic"
        this.inputContainer.hitArea = this.app.screen

        this.inputContainer.on("pointermove", (event: FederatedPointerEvent) => {this.setPointer(event.getLocalPosition(this.inputContainer))})
        this.inputContainer.on("pointerenter", (event: FederatedPointerEvent) => {this.setPointer(event.getLocalPosition(this.inputContainer))})
        this.inputContainer.on("pointerleave", (_event: FederatedPointerEvent) => {this.setPointer(null)})

        this.inputContainer.on("pointerdown", (event: FederatedPointerEvent) => {this.onClick.emit(event.getLocalPosition(this.camera.stage))})

        // this.setListeners(this.camera.signals)
    }

    setListeners(signals: CameraSignals, onHover: SignalEmitter<Button>) {
        // Spoofing updates, because this will change the local coordinates
        signals.onMove.subscribe((_state: CameraState) => {this.onUpdate.emit(this.cameraCoordinates())})
        signals.onZoom.subscribe((_state: CameraState) => {this.onUpdate.emit(this.cameraCoordinates())})

        onHover.subscribe((_button: Button) => {this.setPointer(null)})
    }

    private cameraCoordinates() {
        return this.pointer !== null ? this.camera.stage.toLocal(this.pointer) : null
    }

    private setPointer(pointer: Point | null) {
        if (this.pointer !== null) {
            if (pointer === null || pointer.x !== this.pointer.x || pointer.y !== this.pointer.y) {
                this.pointer = pointer
                this.onUpdate.emit(this.cameraCoordinates())
            }
        } else if (pointer !== null) {
            this.pointer = pointer
            this.onUpdate.emit(this.cameraCoordinates())
        }
    }
}