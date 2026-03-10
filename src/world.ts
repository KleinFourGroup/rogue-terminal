import { Container, Graphics } from "pixi.js"
import { ECS } from "./ecs"
import { BackgroundGrid } from "./grid/background_grid"
import { Entity } from "./entity"
import { TextSprite } from "./text/text_sprite"
import { VisibilityManager } from "./visibility_manager"
import { EntityVisibilityTracker } from "./entity_visibility_tracker"

export class World extends Container {
    rows: number
    cols: number

    entities: ECS
    ground: BackgroundGrid
    
    visibilityManager: VisibilityManager
    visibleEntityTracker: EntityVisibilityTracker

    animatedActives: Entity[]

    constructor(rows: number, cols: number) {
        super()

        this.rows = rows
        this.cols = cols

        this.entities = new ECS(this.rows, this.cols)
        this.ground = new BackgroundGrid(this.rows, this.cols)

        this.visibilityManager = new VisibilityManager(this.rows, this.cols)
        this.visibleEntityTracker = new EntityVisibilityTracker(this.entities, this.visibilityManager)

        this.ground.setupListeners(this.entities.signals.onAdd, this.entities.signals.onDelete, this.visibilityManager.signals.onTileVisible, this.visibilityManager.signals.onTileHide)
        this.visibleEntityTracker.setupListeners(this.visibilityManager.signals.onTileVisible, this.visibilityManager.signals.onTileHide, this.entities.signals.onAdd, this.entities.signals.onDelete, this.entities.signals.onMove)

        this.animatedActives = []

        this.entities.setWorld(this)

        this.addChild(this.ground)
        this.addChild(this.entities.stage)

        this.setVisibilityMask(this.visibilityManager.visibleTileMask)

        // Testing
        this.visibleEntityTracker.signals.onReveal.subscribe((entity: Entity) => {console.log(`Visible: ${entity.sprite.character}`)})
        this.visibleEntityTracker.signals.onHide.subscribe((entity: Entity) => {console.log(`Hidden: ${entity.sprite.character}`)})
    }

    setVisibilityMask(mask: Graphics) {
        this.entities.setVisibilityMask(mask)
        this.ground.alertLayer.setVisibilityMask(mask)
    }

    isNavigable(row: number, col: number, ignoreList: Entity[] = [], width: number = 1, height: number = 1) {
        for (let checkRow = row; checkRow < row + height; checkRow++) {
            for (let checkCol = col; checkCol < col + width; checkCol++) {
                if (!this.entities.isFree(checkRow, checkCol, ignoreList) || !this.ground.isValid(checkRow, checkCol)) {
                    return false
                }
            }
        }

        return true
    }

    addEntity(entity: Entity) {
        this.entities.addEntity(entity)
    }

    setValid(row: number, col: number, valid: boolean = true) {
        this.ground.setValid(row, col, valid)
    }

    setGroundText(row: number, col: number, sprite: TextSprite) {
        this.ground.setText(row, col, sprite)
    }

    nextAI() {
        return this.entities.nextAI()
    }

    advanceTicks(ticks: number) {
        this.entities.advanceTicks(ticks)
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

        this.animatedActives = activeEntities

        return unfinished
    }
}