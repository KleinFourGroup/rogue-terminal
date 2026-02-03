import { Container } from "pixi.js";
import { IScene } from "./scene";
import { GameApp } from "./app";
import { TextSprite } from "./text_sprite";


export class GameScene extends Container implements IScene {
    app: GameApp
    player: TextSprite

    constructor(app: GameApp) {
        super()
        this.app = app

        this.player = new TextSprite("@")
        
        // Center the sprite's anchor point
        this.player.anchor.set(0.5)

        // Move the sprite to the center of the screen
        this.player.position.set(this.app.screen.width / 2, this.app.screen.height / 2)

        // Add the userSprite to the stage
        this.addChild(this.player)
    }

    update(deltaMS: number): void {
        this.player.rotation += deltaMS * 2 * Math.PI / 1000
    }

}