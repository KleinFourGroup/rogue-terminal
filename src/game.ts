import { Container } from "pixi.js"
import { IScene } from "./scene"
import { GameApp } from "./app"
import { Camera } from "./camera"
import { Entity } from "./entity"
import { World } from "./world"
import { TILE_SIZE } from "./text/canvas_style"
import { buildLevel } from "./test_level/level_builder"
import { TurnLogic } from "./turn_logic"
import { TurnDisplay } from "./turn_display"

const ROOM_ROWS = 3
const ROOM_COLS = 3
const ROOM_SIZE = 11

const TILES_DIAGONAL = 31

const FOV_DISTANCE = 5

export class GameScene extends Container implements IScene {
    app: GameApp
    camera: Camera
    player: Entity
    level: World
    elapsed: number

    turnLogic: TurnLogic
    turnDisplay: TurnDisplay

    constructor(app: GameApp) {
        super()
        this.app = app
        this.camera = new Camera(this.app, this)

        const [level, player] = buildLevel(ROOM_ROWS, ROOM_COLS, ROOM_SIZE, FOV_DISTANCE, app.caches)
        this.level = level
        this.player = player

        this.turnLogic = new TurnLogic(this.level)
        this.turnDisplay = new TurnDisplay()
        this.turnDisplay.setVisibility(this.level.visibilityManager)

        this.elapsed = 0

        this.addChild(this.level)

        this.level.calculateView()
        const updated = this.level.ground.updateTileAlphas(this.level.entities.entities, this.level.visibilityManager, this.level.memories)
        this.app.debugOverlay.setAlphaUpdates(updated)
        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)
    }

    update(deltaMS: number): void {
        this.turnDisplay.updateQueue()

        while (this.turnDisplay.isReady()) {
            // TODO: more robust null handling
            const entity = this.turnLogic.advanceTurn()!
            const description = this.turnLogic.resolve()!

            this.turnDisplay.enqueue(entity, description)
            this.turnDisplay.updateQueue()
        }

        const actives = this.turnDisplay.animateActive(deltaMS)

        const updated = this.level.ground.updateTileAlphas(actives, this.level.visibilityManager, this.level.memories)
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