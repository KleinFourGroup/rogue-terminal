import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { Camera } from "./camera"
import { Entity } from "./entity"
import { TurnManager, TurnStatus } from "./turn_manager"
import { World } from "./world"
import { AILogic } from "./behaviors/behavior"
import { TILE_SIZE } from "./text/canvas_style"
import { Observer } from "./visibility/observer"
import { buildLevel } from "./test_level/level_builder"

const ROOM_ROWS = 3
const ROOM_COLS = 3
const ROOM_SIZE = 11

const TILES_DIAGONAL = 31

const FOV_DISTANCE = 5

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

        this.turnManager = new TurnManager()

        const [level, player] = buildLevel(ROOM_ROWS, ROOM_COLS, ROOM_SIZE, FOV_DISTANCE, app.caches)
        this.level = level
        this.player = player

        this.elapsed = 0

        this.addChild(this.level)

        this.level.calculateView()
        const updated = this.level.ground.updateTileAlphas(this.level.entities.entities, this.level.visibilityManager, this.level.memories)
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
            if (this.turnManager.currentTurn!.hasComponent(Observer)) {
                console.log("Updating visibility!")
                this.level.calculateView()
            }
            this.turnManager.finishTurn()
        }

        const updated = this.level.ground.updateTileAlphas(this.level.animatedActives, this.level.visibilityManager, this.level.memories)
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