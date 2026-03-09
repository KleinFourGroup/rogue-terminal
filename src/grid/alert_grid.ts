import { Container, Graphics } from "pixi.js"
import { COLORS } from "../colors"
import { Entity } from "../entity"
import { TILE_SIZE } from "../text/canvas_style"
import { SignalEmitter } from "../signal"

const STROKE_WIDTH = 5

export class AlertGrid extends Container {
    rows: number
    cols: number

    alerts: (Graphics | null)[]
    ownershipArray: Set<Entity>[]
    ownershipMap: Map<Entity, Set<number>>
    visibleMask: Graphics | null

    constructor(rows: number, cols: number) {
        super()
        this.rows = rows
        this.cols = cols

        this.alerts = new Array<Graphics | null>(this.rows * this.cols).fill(null)
        this.ownershipArray = Array.from({ length: this.rows * this.cols }, () => new Set<Entity>())
        this.ownershipMap = new Map<Entity, Set<number>>()

        this.visibleMask = null
    }

    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    setVisibilityMask(mask: Graphics) {
        this.visibleMask = mask
        this.mask = mask
        this.addChild(mask)
    }

    setupListeners(onRemoveEntity: SignalEmitter<Entity>) {
        const callback = (entity: Entity) => {
            if (this.ownershipMap.has(entity)) {
                const indices = this.ownershipMap.get(entity)!
                for (const index of indices) {
                    const alerts = this.ownershipArray[index]
                    alerts.delete(entity)

                    if (alerts.size === 0) {
                        const col = index % this.cols
                        const row = (index - col) / this.cols
                        this.drawAlert(row, col, null)
                    }
                }
                this.ownershipMap.delete(entity)
            }
        }

        onRemoveEntity.subscribe(callback)
    }

    setAlert(row: number, col: number, entity: Entity) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            const alerts = this.ownershipArray[index]
            const wasClear = alerts.size === 0

            alerts.add(entity)
            if (!this.ownershipMap.has(entity)) {
                this.ownershipMap.set(entity, new Set<number>())
            }
            this.ownershipMap.get(entity)!.add(index)

            if (wasClear) {
                this.drawAlert(row, col, COLORS.DARK_NEON_RED)
            }
        }
    }

    clearAlert(row: number, col: number, entity: Entity) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            const alerts = this.ownershipArray[index]

            alerts.delete(entity)

            if (this.ownershipMap.has(entity)) {
                const indices = this.ownershipMap.get(entity)!
                indices.delete(index)
                if (indices.size === 0) {
                    this.ownershipMap.delete(entity)
                }
            }
            
            if (alerts.size === 0) {
                this.drawAlert(row, col, null)
            }
        }
    }

    drawAlert(row: number, col: number, color: string | null) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            function drawRoundedBox(graphics: Graphics, color: string) {
                return graphics.roundRect(STROKE_WIDTH / 2, STROKE_WIDTH / 2, TILE_SIZE - STROKE_WIDTH, TILE_SIZE - STROKE_WIDTH, TILE_SIZE / 4).stroke({ width: STROKE_WIDTH, color: color })
            }

            if (this.alerts[index] !== null) {
                const graphics = this.alerts[index]
                graphics.clear()
                if (color !== null) {
                    drawRoundedBox(graphics, color)
                }
            } else if (color !== null) {
                const graphics = drawRoundedBox(new Graphics(), color)
                this.alerts[index] = graphics
                this.addChild(graphics)

                graphics.position.set(col * TILE_SIZE, row * TILE_SIZE)

                // Hideous insert sort, but in theory this should only be done once anyways, so...
                const laterChildren = this.alerts.filter((val, ind) => ind > index && val !== null) as Graphics[]
                for (const child of laterChildren) {
                    this.removeChild(child)
                    this.addChild(child)
                }
            }
        }
    }
}
