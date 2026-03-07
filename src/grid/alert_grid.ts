import { Container, Graphics } from "pixi.js"
import { COLORS } from "../colors"
import { Entity } from "../entity"
import { TILE_SIZE } from "../text/canvas_style"
import { SignalEmitter } from "../signal"


export class AlertGrid extends Container {
    rows: number
    cols: number

    alerts: (Graphics | null)[]
    ownershipArray: Set<Entity>[]
    ownershipMap: Map<Entity, Set<number>>

    constructor(rows: number, cols: number) {
        super()
        this.rows = rows
        this.cols = cols

        this.alerts = new Array<Graphics | null>(this.rows * this.cols).fill(null)
        this.ownershipArray = Array.from({ length: this.rows * this.cols }, () => new Set<Entity>())
        this.ownershipMap = new Map<Entity, Set<number>>()
    }

    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
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

            if (this.alerts[index] !== null) {
                const graphics = this.alerts[index]
                graphics.clear()
                if (color !== null) {
                    graphics.roundRect(0, 0, TILE_SIZE, TILE_SIZE, TILE_SIZE / 4).stroke({ width: 5, color: color })
                }
            } else if (color !== null) {
                const graphics = new Graphics().roundRect(0, 0, TILE_SIZE, TILE_SIZE, TILE_SIZE / 4).stroke({ width: 5, color: color })
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
