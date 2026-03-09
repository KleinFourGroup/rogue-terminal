import { Container, Graphics } from "pixi.js"
import { ECS } from "./ecs"
import { BackgroundGrid } from "./grid/background_grid"
import { Entity } from "./entity"
import { TextSprite } from "./text/text_sprite"
import { VisibilityManager } from "./grid/visibility_manager"

export class World extends Container {
    rows: number
    cols: number

    entities: ECS
    ground: BackgroundGrid
    
    visibilityManager: VisibilityManager

    animatedActives: Entity[]

    constructor(rows: number, cols: number) {
        super()

        this.rows = rows
        this.cols = cols

        this.entities = new ECS(this.rows, this.cols)
        this.ground = new BackgroundGrid(this.rows, this.cols)

        this.visibilityManager = new VisibilityManager(this.rows, this.cols)

        this.ground.setupListeners(this.entities.signals.onAdd, this.entities.signals.onDelete, this.visibilityManager.onCalculateVisibility)

        this.animatedActives = []

        this.entities.setWorld(this)

        this.addChild(this.ground)
        this.addChild(this.entities.stage)

        this.setVisibilityMask(this.visibilityManager.visibleMask)
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