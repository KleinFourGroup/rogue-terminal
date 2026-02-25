import { Container } from "pixi.js"
import { ECS } from "./ecs"
import { BackgroundGrid } from "./background_grid"
import { Entity } from "./entity"
import { TextSprite } from "./text_sprite"
import { NavigationGrid, NavigationNode } from "./navigation_graph"
import { GridDirection, TILE_OFFSETS } from "./position"

export class World extends Container{
    rows: number
    cols: number

    entities: ECS
    ground: BackgroundGrid

    constructor(rows: number, cols: number) {
        super()

        this.rows = rows
        this.cols = cols

        this.entities = new ECS(this.rows, this.cols)
        this.ground = new BackgroundGrid(this.rows, this.cols)

        this.entities.setWorld(this)

        this.addChild(this.ground)
        this.addChild(this.entities.stage)
    }

    isNavigable(row: number, col: number) {
        return this.entities.isFree(row, col) && this.ground.isValid(row, col)
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

    updateTileAlphas() {
        this.ground.clearAlphas()

        for (const entity of this.entities.entities) {
            const tiles = entity.intersectingTiles()
            for (const tilePosition of tiles) {
                const overlap = entity.tileOverlap(tilePosition.row, tilePosition.col)
                this.ground.setAlpha(tilePosition.row, tilePosition.col, overlap)
            }
        }
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

        return unfinished
    }

    getNavigationGraph(row: number, col: number) {
        const dirs = Object.values(GridDirection).filter((val) => typeof val === "number")
        const navGraph = new NavigationGrid(this.rows, this.cols)

        const startNode = new NavigationNode(row, col)
        startNode.distance = 0

        function setEdges(node: NavigationNode, world: World) {
            for (const dir of dirs) {
                node.edges[dir] = world.isNavigable(node.row + TILE_OFFSETS[dir].row, node.col + TILE_OFFSETS[dir].col)
            }
        }

        setEdges(startNode, this)

        navGraph.setNode(row, col, startNode)

        let finalized = navGraph.finalizeLowest()

        while (finalized !== null) {
            for (const dir of dirs) {
                if (finalized.edges[dir] && !navGraph.hasNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col)) {
                    const newNode = new NavigationNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col)
                    setEdges(newNode, this)
                    navGraph.setNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col, newNode)
                }
            }
            
            navGraph.propagate(finalized.row, finalized.col)
            finalized = navGraph.finalizeLowest()
        }
    }
}