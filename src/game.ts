import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite, TILE_SIZE } from "./text_sprite"
import { Camera } from "./camera"
import { Entity } from "./entity"
import { EntityList } from "./entity_list"

const ROWS = 11
const COLS = 11

export class GameScene extends Container implements IScene {
    app: GameApp
    camera: Camera
    player: Entity
    entities: EntityList
    ground: Container
    elapsed: number

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        this.player = new Entity("@", Math.floor(ROWS / 2), Math.floor(COLS / 2))
        this.entities = new EntityList(COLS, ROWS)

        this.ground = new Container()

        const grid: TextSprite[][] = []

        for (let row = 0; row < ROWS; row++) {
            grid.push([])
            for (let col = 0; col < COLS; col++) {
                const tile = new TextSprite(".")
                tile.position.set(row * TILE_SIZE, col * TILE_SIZE)
                grid[row].push(tile)
                this.ground.addChild(tile)

                if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                    const wall = new Entity("#", row, col)
                    this.entities.addEntity(wall)
                }
            }
        }

        this.entities.addEntity(this.player)

        this.elapsed = 0

        this.addChild(this.ground)
        this.addChild(this.entities.stage)
    }

    tick() {
        console.log("Tick!")
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

        } while (!this.entities.isFree(this.player.row + dy, this.player.col + dx) || this.player.col + dx < 0 || this.player.col + dx >= COLS || this.player.row + dy < 0 || this.player.row + dy >= ROWS)

        this.player.setPosition(this.player.row + dy, this.player.col + dx)
        // console.log(this.player.row, this.player.col)
    }

    update(deltaMS: number): void {
        this.elapsed += deltaMS 
        while (this.elapsed >= 1000) {
            this.tick()
            this.elapsed -= 1000
        }

        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)
    }
}