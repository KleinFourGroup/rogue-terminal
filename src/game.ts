import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite, TILE_SIZE } from "./text_sprite"
import { Camera } from "./camera"
import { Entity } from "./entity"
import { EntityList } from "./entity_list"
import { getSmoothMove } from "./move_action"

const ROWS = 11
const COLS = 11

function randomDirection() {
    const rand = Math.floor(Math.random() * 8)
        switch (rand) {
            case 0:
                return [1, 1]
            case 1:
                return [1, 0]
            case 2:
                return [1, -1]
            case 3:
                return [0, 1]
            case 4:
                return [0, -1]
            case 5:
                return [-1, 1]
            case 6:
                return [-1, 0]
            case 7:
                return [-1, -1]
            default:
                return [0, 0]
        }
}

export class GameScene extends Container implements IScene {
    app: GameApp
    camera: Camera
    player: Entity
    currentTurn: Entity | null
    entities: EntityList
    ground: Container
    elapsed: number

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        this.player = new Entity("@", Math.floor(ROWS / 2), Math.floor(COLS / 2))
        this.player.hasAI = true

        this.currentTurn = null
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
            [dx, dy] = randomDirection()
        } while (!this.entities.isFree(this.currentTurn!.row + dy, this.currentTurn!.col + dx) || this.currentTurn!.col + dx < 0 || this.currentTurn!.col + dx >= COLS || this.currentTurn!.row + dy < 0 || this.currentTurn!.row + dy >= ROWS)

        const action = getSmoothMove(this.currentTurn!, this.currentTurn!.row + dy, this.currentTurn!.col + dx)
        this.currentTurn?.actor.doAction(action)
        // console.log(this.player.row, this.player.col)
    }

    update(deltaMS: number): void {
        if (this.currentTurn === null) {
            console.log("No current turn!  Fetching next one...")
            const nextTurn = this.entities.nextAI()
            const toSkip = nextTurn!.actor.actionCoolDown
            this.entities.advance(toSkip)
            this.currentTurn = nextTurn
        }

        if (this.currentTurn?.animationManager.isIdle()) {
            this.tick()
        }

        this.currentTurn?.animationManager.animate(deltaMS)

        if (this.currentTurn?.animationManager.isIdle()) {
            this.currentTurn = null
        }

        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)
    }
}