import { Container, Graphics } from "pixi.js"
import { GameApp } from "./app"
import { COLORS } from "./colors"
import { SignalEmitter } from "./signal"

const WAIT_SIZE = 50
const STROKE_SIZE = 5
const EDGE_MARGIN = 10

class WaitButton extends Container {
    background: Graphics

    constructor() {
        super()
        this.background = new Graphics()
        this.background.rect(0, 0, WAIT_SIZE, WAIT_SIZE).fill(COLORS.DARK_TERMINAL_AMBER)

        this.addChild(this.background)

        this.eventMode = "dynamic"
    }
}

export class GameplayUI extends Container {
    app: GameApp
    waitButton: Graphics

    hoverRect: Graphics
    currentHover: Graphics | null

    onHoverStart: SignalEmitter<Graphics>

    constructor(app: GameApp) {
        super()

        this.app = app
        this.waitButton = new Graphics()
        this.waitButton.rect(0, 0, WAIT_SIZE, WAIT_SIZE).fill(COLORS.DARK_TERMINAL_AMBER)

        this.hoverRect = new Graphics()
        this.currentHover = null

        this.onHoverStart = new SignalEmitter<Graphics>()

        this.addChild(this.waitButton)
        this.addChild(this.hoverRect)

        this.waitButton.eventMode = "dynamic"

        this.waitButton.on("pointerover", (_event) => {this.setHover(this.waitButton)})
        this.waitButton.on("pointerout", (_event) => {this.setHover(null)})
    }
    
    setHover(button: Graphics | null) {
        const isNew = button !== this.currentHover

        this.currentHover = button
        this.hoverRect.clear()

        if (button !== null) {
            const box = button.getBounds()
            this.hoverRect.rect(
                box.x + STROKE_SIZE / 2,
                box.y + STROKE_SIZE / 2,
                box.width - STROKE_SIZE,
                box.height - STROKE_SIZE
            ).stroke({width: STROKE_SIZE, color: COLORS.TERMINAL_AMBER})

            if (isNew) {
                this.onHoverStart.emit(button)
            }
        }
    }

    updateResolution() {
        this.waitButton.position.set(
            this.app.width - this.waitButton.width - EDGE_MARGIN,
            this.app.height - this.waitButton.height - EDGE_MARGIN
        )
    }
}