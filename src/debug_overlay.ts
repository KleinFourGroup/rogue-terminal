import { Container, Text } from "pixi.js"
import { GameApp } from "./app";
import { TERMINAL_GREEN } from "./colors";

export class DebugOverlay extends Container {
    app: GameApp
    text: Text

    constructor(app: GameApp) {
        super()
        this.app = app

        this.text = new Text({
            text: "",
            style: {
                fill: TERMINAL_GREEN,
                fontSize: 24
            }
        })

        this.text.anchor.set(1, 0)
        this.text.position.set(-5, 5)
        this.addChild(this.text)
    }

    updateResolution() {
        this.text.text = `${this.app.width}x${this.app.height}`
        this.text.position.set(this.app.width - 5, 5)
    }
}