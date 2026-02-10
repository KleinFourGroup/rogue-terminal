import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite, TILE_SIZE } from "./text_sprite"
import { Camera } from "./camera"

const ROWS = 10
const COLS = 10

export class GameScene extends Container implements IScene {
    app: GameApp
    camera: Camera
    player: TextSprite
    ground: Container
    elapsed: number

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        this.player = new TextSprite("@")
        this.ground = new Container()

        const grid: TextSprite[][] = []

        for (let row = 0; row < ROWS; row++) {
            grid.push([])
            for (let col = 0; col < COLS; col++) {
                const tile = new TextSprite(".")
                tile.position.set(row * TILE_SIZE, col * TILE_SIZE)
                grid[row].push(tile)
                this.ground.addChild(tile)
            }
        }

        this.elapsed = 0

        this.addChild(this.ground)
        this.addChild(this.player)
    }

    update(deltaMS: number): void {
        this.elapsed += deltaMS * 2 * Math.PI / 1000
        this.camera.setRotation(this.elapsed)
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)
    }
}