import { Container, FederatedPointerEvent } from "pixi.js"
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
    inputContainer: Container
    player: Entity
    level: World
    elapsed: number

    turnLogic: TurnLogic
    turnDisplay: TurnDisplay

    constructor(app: GameApp) {
        super()
        this.app = app
        this.inputContainer = new Container()

        const [level, player] = buildLevel(ROOM_ROWS, ROOM_COLS, ROOM_SIZE, FOV_DISTANCE, app.caches)
        this.level = level
        this.player = player

        this.camera = new Camera(this.app, this.level)

        this.turnLogic = new TurnLogic(this.level)
        this.turnDisplay = new TurnDisplay(this.level)

        this.elapsed = 0

        this.inputContainer.addChild(this.level)
        this.addChild(this.inputContainer)

        this.level.calculateView()
        this.level.drawView()
        const updated = this.level.ground.updateTileAlphas(new Set<Entity>(this.level.entities.entities), this.level.visibilityDisplay, this.level.memories)
        this.app.debugOverlay.setAlphaUpdates(updated)
        this.camera.setPosition(this.player.sprite.x, this.player.sprite.y)

        this.inputContainer.eventMode = "dynamic"
        this.inputContainer.hitArea = app.screen
        this.inputContainer.on("pointermove", (event: FederatedPointerEvent) => {this.handlePointerIn(event)})
        this.inputContainer.on("pointerenter", (event: FederatedPointerEvent) => {this.handlePointerIn(event)})
        this.inputContainer.on("pointerleave", (event: FederatedPointerEvent) => {this.handlePointerOut(event)})
    }

    handlePointerIn(event: FederatedPointerEvent) {
        const pointer = event.getLocalPosition(this.level)
        const row = Math.floor(pointer.y / TILE_SIZE)
        const col = Math.floor(pointer.x / TILE_SIZE)
        this.level.setHighlight(row, col)
    }

    handlePointerOut(event: FederatedPointerEvent) {
        this.level.setHighlight(-1, -1)
    }

    update(deltaMS: number): void {
        let updatedEntities = this.turnDisplay.updateQueue()

        while (this.turnDisplay.isReady()) {
            // TODO: more robust null handling
            const entity = this.turnLogic.advanceTurn()!
            const description = this.turnLogic.resolve()!

            this.turnDisplay.enqueue(entity, description)
            const skipped = this.turnDisplay.updateQueue()
            updatedEntities = updatedEntities.union(skipped)
        }

        const actives = this.turnDisplay.animateActive(deltaMS)
        updatedEntities = updatedEntities.union(actives)

        const updated = this.level.ground.updateTileAlphas(updatedEntities, this.level.visibilityDisplay, this.level.memories)
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