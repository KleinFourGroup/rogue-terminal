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
import { PointerInput } from "./pointer_input"
import { AILogic } from "./behaviors/behavior"
import { IdleDisplay } from "./idle_display"
import { Actor } from "./actor"
import { BackgroundAnimation } from "./animation/background_animator"

const ROOM_ROWS = 3
const ROOM_COLS = 3
const ROOM_SIZE = 11

const TILES_DIAGONAL = 31

const FOV_DISTANCE = 5

export class GameScene extends Container implements IScene {
    app: GameApp

    player: Entity
    level: World
    
    camera: Camera
    pointerInput: PointerInput

    elapsed: number

    turnLogic: TurnLogic
    turnDisplay: TurnDisplay

    idleDisplay: IdleDisplay

    constructor(app: GameApp) {
        super()
        this.app = app

        const [level, player] = buildLevel(ROOM_ROWS, ROOM_COLS, ROOM_SIZE, FOV_DISTANCE, app.caches)
        this.level = level
        this.player = player

        this.camera = new Camera(this.app, this.level)
        this.pointerInput = new PointerInput(this.app, this.camera)

        this.turnLogic = new TurnLogic(this.level)
        this.turnDisplay = new TurnDisplay(this.level)

        this.idleDisplay = new IdleDisplay(this.level)
        this.idleDisplay.setupListeners(this.turnDisplay.signals)

        this.elapsed = 0

        this.addChild(this.pointerInput.inputContainer)
        this.pointerInput.inputContainer.addChild(this.level)

        this.pointerInput.onUpdate.subscribe((pointer) => {
            // console.log(pointer)
            const target = this.level.getTarget(pointer)
            this.level.highlighter.setTarget(target)
        })

        this.pointerInput.onClick.subscribe((pointer) => {
            const target = this.level.getTarget(pointer)
            const playerLogic = this.player.getComponent(AILogic)!
            playerLogic.behaviorLogic.passInput(target)
        })

        // Not a fan of how this looks
        for (const entity of this.level.entities.getComponentList(Actor)) {
            this.idleDisplay.setEntity(entity, BackgroundAnimation.HOVER)
        }

        this.level.calculateView()
        this.level.drawView()
        const updated = this.level.ground.updateTileAlphas(new Set<Entity>(this.level.entities.entities), this.level.visibilityDisplay, this.level.memories)
        this.app.debugOverlay.setAlphaUpdates(updated)
        this.camera.setPosition(this.player.graphics.x + this.player.sprite.x, this.player.graphics.y + this.player.sprite.y)
    }

    update(deltaMS: number): void {
        let updatedEntities = this.turnDisplay.updateQueue()

        while (this.turnDisplay.isReady()) {
            // TODO: more robust null handling
            const entity = this.turnLogic.advanceTurn()!
            const description = this.turnLogic.resolve()

            if (description === null) {
                break
            }

            this.turnDisplay.enqueue(entity, description)
            const skipped = this.turnDisplay.updateQueue()
            updatedEntities = updatedEntities.union(skipped)
        }

        const actives = this.turnDisplay.animateActive(deltaMS)
        updatedEntities = updatedEntities.union(actives)

        const backgrounds = this.idleDisplay.animateBackground(deltaMS)
        updatedEntities = updatedEntities.union(backgrounds)

        const updated = this.level.ground.updateTileAlphas(updatedEntities, this.level.visibilityDisplay, this.level.memories)
        this.app.debugOverlay.setAlphaUpdates(updated)
        this.camera.setPosition(this.player.graphics.x + this.player.sprite.x, this.player.graphics.y + this.player.sprite.y)
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