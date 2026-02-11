import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite, TILE_SIZE } from "./text_sprite"
import { Camera } from "./camera"
import { Entity } from "./entity"

const ROWS = 10
const COLS = 10

export class GameScene extends Container implements IScene {
    app: GameApp
    camera: Camera
    player: Entity
    ground: Container
    elapsed: number

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        this.player = new Entity("@")
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
        this.addChild(this.player.sprite)
    }

    tick() {
        let dx = 0, dy = 0
        do {
            const rand = Math.floor(Math.random() * 8)
            switch (rand) {
                case 0:
                    dx = 1
                    dy = 1
                    break
                case 1:
                    dx = 1
                    dy = 0
                    break
                case 2:
                    dx = 1
                    dy = -1
                    break
                case 3:
                    dx = 0
                    dy = 1
                    break
                case 4:
                    dx = 0
                    dy = -1
                    break
                case 5:
                    dx = -1
                    dy = 1
                    break
                case 6:
                    dx = -1
                    dy = 0
                    break
                case 7:
                    dx = -1
                    dy = -1
                    break
                default:
                    dx = 0
                    dy = 0
            }
        } while (this.player.col + dx < 0 || this.player.col + dx >= COLS || this.player.row + dy < 0 || this.player.row + dy >= ROWS)

        this.player.col += dx
        this.player.row += dy

        this.player.sprite.x = this.player.col * TILE_SIZE
        this.player.sprite.y = this.player.row * TILE_SIZE
        // console.log(this.player.row, this.player.col)
    }

    update(deltaMS: number): void {
        this.elapsed += deltaMS 
        while (this.elapsed >= 1000) {
            this.tick()
            this.elapsed -= 1000
        }

        this.camera.setPosition(this.player.col * TILE_SIZE + this.player.width * TILE_SIZE / 2, this.player.row * TILE_SIZE + this.player.height * TILE_SIZE / 2)
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)
    }
}