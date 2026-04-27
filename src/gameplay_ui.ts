import { Container, Graphics } from "pixi.js"
import { GameApp } from "./app"
import { COLORS } from "./colors"
import { SignalEmitter } from "./signal"
import { Button } from "./button"

const WAIT_SIZE = 50
const STROKE_SIZE = 5
const EDGE_MARGIN = 10

class WaitButton extends Button {
    parent: GameplayUI
    background: Graphics

    constructor(parent: GameplayUI) {
        super()
        this.parent = parent
        this.background = new Graphics()
        this.background.rect(0, 0, WAIT_SIZE, WAIT_SIZE).fill(COLORS.DARK_TERMINAL_AMBER)

        this.addChild(this.background)

        this.eventMode = "dynamic"
    }

    onHoverOver() {
        this.parent.setHover(this)
    }

    onHoverOut() {
        this.parent.setHover(null)
    }

    onTap() {
        console.log("Wait!")
    }
}

export class GameplayUI extends Container {
    app: GameApp
    waitButton: WaitButton

    hoverRect: Graphics
    currentHover: Button | null

    onHoverStart: SignalEmitter<Button>

    constructor(app: GameApp) {
        super()

        this.app = app
        this.waitButton = new WaitButton(this)

        this.hoverRect = new Graphics()
        this.currentHover = null

        this.onHoverStart = new SignalEmitter<Button>()

        this.addChild(this.waitButton)
        this.addChild(this.hoverRect)
    }
    
    setHover(button: Button | null) {
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