import { Container, Graphics } from "pixi.js"
import { GameApp } from "./app"
import { COLORS } from "./colors"

const WAIT_SIZE = 50
const STROKE_SIZE = 5
const EDGE_MARGIN = 10

export class GameplayUI extends Container {
    app: GameApp
    waitButton: Graphics
    hoverRect: Graphics

    currentHover: Graphics | null

    constructor(app: GameApp) {
        super()

        this.app = app
        this.waitButton = new Graphics()
        this.waitButton.rect(0, 0, WAIT_SIZE, WAIT_SIZE).fill(COLORS.DARK_TERMINAL_AMBER)

        this.hoverRect = new Graphics()
        this.currentHover = null

        this.addChild(this.waitButton)
        this.addChild(this.hoverRect)

        this.waitButton.eventMode = "dynamic"

        this.waitButton.on("pointerover", (_event) => {this.hoverOver(this.waitButton)})
        this.waitButton.on("pointerout", (_event) => {this.hoverOver(null)})
    }
    
    hoverOver(button: Graphics | null) {
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
        }
    }

    updateResolution() {
        this.waitButton.position.set(
            this.app.width - this.waitButton.width - EDGE_MARGIN,
            this.app.height - this.waitButton.height - EDGE_MARGIN
        )
    }
}