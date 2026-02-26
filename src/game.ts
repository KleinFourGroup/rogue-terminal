import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite } from "./text_sprite"
import { Camera } from "./camera"
import { Entity } from "./entity"
import { TurnManager, TurnStatus } from "./turn_manager"
import { World } from "./world"
import { AILogic, setupAI } from "./behaviors/behavior"
import { RandomWalkAI } from "./behaviors/random_walk"

const ROWS = 11
const COLS = 11

const TICK_TIME = 1000 / 1200

export class GameScene extends Container implements IScene {
    app: GameApp
    camera: Camera
    player: Entity
    level: World
    elapsed: number

    turnManager: TurnManager

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        this.player = new Entity("@", Math.floor(ROWS / 2), Math.floor(COLS / 2))
        setupAI(this.player, new RandomWalkAI(this.player, true)) // Still probably don't want this being called directly

        this.turnManager = new TurnManager()

        this.level = new World(ROWS, COLS)

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const tile = new TextSprite(".")
                this.level.setGroundText(row, col, tile)
                this.level.setValid(row, col, true)

                if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                    const wall = new Entity("#", row, col)
                    this.level.addEntity(wall)
                }
            }
        }

        this.level.addEntity(this.player)

        for (let drow = -1; drow <= 1; drow += 2) {
            for (let dcol = -1; dcol <= 1; dcol += 2) {
                for (let count = 1; count <= 3; count++) {
                    const newEntity = new Entity("O", this.player.row + count * drow, this.player.col + count * dcol)
                    setupAI(newEntity, new RandomWalkAI(newEntity, false))
                    this.level.addEntity(newEntity)
                }
            }
        }

        this.elapsed = 0

        this.addChild(this.level)

        this.level.updateTileAlphas()
        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }

    tickAI() {
        console.log("Tick!")

        const action = this.turnManager.currentTurn!.getComponent(AILogic)!.getAction()
        console.assert(action !== null)
        this.turnManager.currentTurn?.actor.setAction(action!)
        // console.log(this.player.row, this.player.col)
    }

    update(deltaMS: number): void {
        if (this.turnManager.status === TurnStatus.NO_TURN) {
            console.log("No current turn!  Fetching next one...")
            const nextTurn = this.level.nextAI()
            const toSkip = nextTurn!.actor.actionCoolDown
            this.level.advanceTicks(toSkip)
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

        const outstanding = this.level.animateActive(deltaMS)
        this.turnManager.setOutstandingAnimations(outstanding)

        if (this.turnManager.status === TurnStatus.FINISH_BLOCK) {
            this.turnManager.checkBlockingAnimation()
        }

        if (this.turnManager.status === TurnStatus.FINISH_TURN) {
            this.turnManager.finishTurn()
        }

        this.level.updateTileAlphas()
        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)
    }
}