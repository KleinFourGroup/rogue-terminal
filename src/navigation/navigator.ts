import { Entity } from "../entity"
import { DIRS, TILE_OFFSETS, TilePosition } from "../position"
import { World } from "../world"
import { NavigationGrid } from "./navigation_graph"
import { NavigationNode } from "./navigation_node"
import { NodePool } from "./node_pool"

export interface WorldNavigatorOptions {
    width: number
    height: number
    ignoreList: Entity[]
    target: TilePosition | null
    pool: NodePool | null
}

const DEFAULT_OPTIONS: WorldNavigatorOptions = {
    width: 1,
    height: 1,
    ignoreList: [],
    target: null,
    pool: null
}

export class WorldNavigator {
    world: World

    constructor(world: World) {
        this.world = world
    }

    setEdges(node: NavigationNode, width: number, height: number, ignoreList: Entity[]) {
        for (const dir of DIRS) {
            node.edges[dir] = this.world.isNavigable(node.row + TILE_OFFSETS[dir].row, node.col + TILE_OFFSETS[dir].col, ignoreList, width, height)
        }
    }

    getNavigationGraph(row: number, col: number, options: Partial<WorldNavigatorOptions> = {}) {
        const fullOptions = { ...DEFAULT_OPTIONS, ...options}
        const pool = fullOptions.pool

        const navGraph = new NavigationGrid(this.world.rows, this.world.cols)

        const startNode = (pool !== null) ? pool.getNode(row, col) : new NavigationNode(row, col)
        startNode.distance = 0 

        this.setEdges(startNode, fullOptions.width, fullOptions.height, fullOptions.ignoreList)

        navGraph.setNode(row, col, startNode)

        let finalized = navGraph.finalizeLowest()

        while (finalized !== null) {
            if (fullOptions.target !== null && finalized.row === fullOptions.target.row && finalized.col === fullOptions.target.col) {
                break
            }
            
            for (const dir of DIRS) {
                if (finalized.edges[dir] && !navGraph.hasNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col)) {
                    const newNode = (pool !== null) ? pool.getNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col) : new NavigationNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col)
                    this.setEdges(newNode, fullOptions.width, fullOptions.height, fullOptions.ignoreList)
                    navGraph.setNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col, newNode)
                }
            }
            
            navGraph.propagate(finalized.row, finalized.col)
            finalized = navGraph.finalizeLowest()
        }

        return navGraph
    }
}