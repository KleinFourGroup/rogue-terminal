import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite } from "./text_sprite"
import { Camera } from "./camera"

export class GameScene extends Container implements IScene {
    app: GameApp
    camera: Camera
    player: TextSprite

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        this.player = new TextSprite("@")
        
        // Center the sprite's anchor point
        this.player.anchor.set(0.5)

        // Add the userSprite to the stage
        this.addChild(this.player)
    }

    update(deltaMS: number): void {
        this.player.rotation += deltaMS * 2 * Math.PI / 1000
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)
    }
}