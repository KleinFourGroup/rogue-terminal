import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { TextSprite } from "./text/text_sprite"
import { Camera } from "./camera"
import { Entity } from "./entity"
import { TurnManager, TurnStatus } from "./turn_manager"
import { World } from "./world"
import { AILogic, setupAI } from "./behaviors/behavior"
import { RandomWalkAI } from "./behaviors/random_walk"
import { RandomMoveTargetAI } from "./behaviors/random_move_target"
import { TILE_SIZE } from "./text/canvas_style"

const ROWS = 21
const COLS = 21

const TILES_DIAGONAL = 31

// const TICK_TIME = 1000 / 1200

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

        this.player = new Entity("@", app.caches, Math.floor(ROWS / 2), Math.floor(COLS / 2))

        this.turnManager = new TurnManager()

        this.level = new World(ROWS, COLS)

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const tile = new TextSprite(".")
                this.level.setGroundText(row, col, tile)
                this.level.setValid(row, col, true)

                if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                    const wall = new Entity("#", app.caches, row, col)
                    this.level.addEntity(wall)
                }
            }
        }

        this.level.addEntity(this.player)
        setupAI(this.player, new RandomMoveTargetAI(this.player, true, app.caches.navNodePool)) // Still probably don't want this being called directly

        for (let drow = -1; drow <= 1; drow += 2) {
            for (let dcol = -1; dcol <= 1; dcol += 2) {
                for (let count = 1; count <= 3; count++) {
                    const newEntity = new Entity("O", app.caches, this.player.row + count * drow, this.player.col + count * dcol)
                    setupAI(newEntity, new RandomWalkAI(newEntity, false))
                    this.level.addEntity(newEntity)
                }
            }
        }

        for (let sign = -1; sign <= 1; sign += 2) {
            for (let flip = 0; flip <= 1; flip++) {
                const newEntity = new Entity("G", app.caches, this.player.row + 3 * sign * flip - 1, this.player.col + 3 * sign * (1 - flip) - 1, 3, 3)
                setupAI(newEntity, new RandomWalkAI(newEntity, false, 2400))
                this.level.addEntity(newEntity)
            }
        }

        const offset = 3
        const rows = [offset, ROWS - offset - 1]
        const cols = [offset, COLS - offset - 1]

        for (const row of rows) {
            const rowSub = row === rows[1] ? 0 : -1
            for (const col of cols) {
                const colSub = col === cols[1] ? 0 : -1

                const newEntity = new Entity("D", app.caches, row + rowSub, col + colSub, 2, 2)
                this.level.addEntity(newEntity)
                setupAI(newEntity, new RandomMoveTargetAI(newEntity, false, app.caches.navNodePool, 600)) // Still probably don't want this being called directly
            }
        }


        this.elapsed = 0

        this.addChild(this.level)

        this.level.visibilityManager.calculateFOV(this.player)
        this.level.ground.visibilityLayer.draw(this.level.visibilityManager)
        const updated = this.level.ground.updateTileAlphas(this.level.entities.entities, this.level.visibilityManager)
        this.app.debugOverlay.setAlphaUpdates(updated)
        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }

    tickAI() {
        const action = this.turnManager.currentTurn!.getComponent(AILogic)!.getAction()
        console.assert(action !== null)
        this.turnManager.currentTurn?.actor.setAction(action!)
        // console.log(this.player.row, this.player.col)
    }

    update(deltaMS: number): void {
        if (this.turnManager.status === TurnStatus.NO_TURN) {
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
            // This whole hack only works for one observer
            if (this.turnManager.currentTurn === this.player) {
                console.log("Updating visibility!")
                this.level.visibilityManager.reset()
                this.level.visibilityManager.calculateFOV(this.player)
                this.level.visibilityManager.calculateNewlyHidden()
                this.level.ground.visibilityLayer.draw(this.level.visibilityManager)
            }
            this.turnManager.finishTurn()
        }

        const updated = this.level.ground.updateTileAlphas(this.level.animatedActives, this.level.visibilityManager)
        this.app.debugOverlay.setAlphaUpdates(updated)
        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }
    
    updateResolution(): void {
        // Move the sprite to the center of the screen
        this.camera.setScreenPosition(this.app.width / 2, this.app.height / 2)

        const screenDiagonal = Math.hypot(this.app.width, this.app.height) / (TILE_SIZE * Math.SQRT2)
        const zoom = screenDiagonal / TILES_DIAGONAL
        this.camera.setZoom(zoom)
        this.app.debugOverlay.setZoom(zoom) // TODO: make less ugly
    }
}