import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite, TILE_SIZE } from "./text_sprite"
import { Camera } from "./camera"
import { Entity } from "./entity"
import { ECS } from "./ecs"
import { getSmoothMove } from "./move_action"
import { TurnManager, TurnStatus } from "./turn_manager"

const ROWS = 11
const COLS = 11

const TICK_TIME = 1000 / 1200

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
    entities: ECS
    ground: Container
    elapsed: number

    turnManager: TurnManager

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        this.player = new Entity("@", Math.floor(ROWS / 2), Math.floor(COLS / 2))
        this.player.hasAI = true

        this.turnManager = new TurnManager()

        this.entities = new ECS(COLS, ROWS)

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

        for (let drow = -1; drow <= 1; drow += 2) {
            for (let dcol = -1; dcol <= 1; dcol += 2) {
                for (let count = 1; count <= 3; count++) {
                    const newEntity = new Entity("O", this.player.row + count * drow, this.player.col + count * dcol)
                    newEntity.hasAI = true
                    this.entities.addEntity(newEntity)
                }
            }
        }

        this.elapsed = 0

        this.addChild(this.ground)
        this.addChild(this.entities.stage)

        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }

    tickAI() {
        console.log("Tick!")
        let dx = 0, dy = 0
        do {
            [dx, dy] = randomDirection()
        } while (!this.entities.isFree(this.turnManager.currentTurn!.row + dy, this.turnManager.currentTurn!.col + dx) || !this.entities.isValid(this.turnManager.currentTurn!.row + dy, this.turnManager.currentTurn!.col + dx))

        const action = getSmoothMove(this.turnManager.currentTurn!, this.turnManager.currentTurn!.row + dy, this.turnManager.currentTurn!.col + dx, this.turnManager.currentTurn === this.player)
        this.turnManager.currentTurn?.actor.setAction(action)
        // console.log(this.player.row, this.player.col)
    }

    animateActive(deltaMS: number) {
        const activeEntities = this.entities.getActive()
        let unfinished = 0
        for (const entity of activeEntities) {
            entity.animationManager.animate(deltaMS)
            if (entity.animationManager.isActive()) {
                unfinished++
            }
        }

        return unfinished
    }

    update(deltaMS: number): void {
        if (this.turnManager.status === TurnStatus.NO_TURN) {
            console.log("No current turn!  Fetching next one...")
            const nextTurn = this.entities.nextAI()
            const toSkip = nextTurn!.actor.actionCoolDown
            this.entities.advanceTicks(toSkip)
            this.turnManager.startTurn(nextTurn!)
        }

        if (this.turnManager.status === TurnStatus.START_TURN) {
            this.turnManager.checkLastAnimation()
        }

        if (this.turnManager.status === TurnStatus.WAIT_FOR_LAST_ANIMATION) {
            this.turnManager.checkLastAnimation()
        }

        if (this.turnManager.status === TurnStatus.RUN_AI) {
            this.tickAI()
            this.turnManager.finishedAI()
        }

        if (this.turnManager.status === TurnStatus.START_BLOCK) {
            // We can cache this from last frame, avoiding a second call to filter,
            // in exchange counting unfinished active animations as we execute them
            // const outstanding = this.entities.getActive().length
            // this.turnManager.setOutstandingAnimations(outstanding)
            this.turnManager.checkOutstandingAnimations()
        }

        if (this.turnManager.status === TurnStatus.ACTION_PROGRESS) {
            const actionStatus = this.turnManager.currentTurn!.actor.advanceAction(deltaMS)
            this.turnManager.updateActionProgress(actionStatus)
        }

        const outstanding = this.animateActive(deltaMS)
        this.turnManager.setOutstandingAnimations(outstanding)

        if (this.turnManager.status === TurnStatus.FINISH_BLOCK) {
            this.turnManager.checkBlockingAnimation()
        }

        if (this.turnManager.status === TurnStatus.FINISH_TURN) {
            this.turnManager.finishTurn()
        }

        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)
    }
}