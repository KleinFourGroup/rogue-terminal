import { Entity } from "../entity";
import { DIRS, TILE_OFFSETS } from "../position";
import { World } from "../world";
import { NavigationGrid } from "./navigation_graph";
import { NavigationNode } from "./navigation_node";
import { NodePool } from "./node_pool";

export interface WorldNavigatorOptions {
     ignoreList: Entity[]
     pool: NodePool | null
}

export class WorldNavigator {
    world: World

    constructor(world: World) {
        this.world = world
    }

    getNavigationGraph(row: number, col: number, options: Partial<WorldNavigatorOptions> = {}) {
        const DEFAULT_OPTIONS: WorldNavigatorOptions = {
            ignoreList: [],
            pool: null
        }

        const fullOptions = { ...DEFAULT_OPTIONS, ...options}
        const ignoreList = fullOptions.ignoreList
        const pool = fullOptions.pool

        const navGraph = new NavigationGrid(this.world.rows, this.world.cols)

        const startNode = (pool !== null) ? pool.getNode(row, col) : new NavigationNode(row, col)
        startNode.distance = 0

        function setEdges(node: NavigationNode, world: World) {
            for (const dir of DIRS) {
                node.edges[dir] = world.isNavigable(node.row + TILE_OFFSETS[dir].row, node.col + TILE_OFFSETS[dir].col, ignoreList)
            }
        }

        setEdges(startNode, this.world)

        navGraph.setNode(row, col, startNode)

        let finalized = navGraph.finalizeLowest()

        while (finalized !== null) {
            for (const dir of DIRS) {
                if (finalized.edges[dir] && !navGraph.hasNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col)) {
                    const newNode = (pool !== null) ? pool.getNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col) : new NavigationNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col)
                    setEdges(newNode, this.world)
                    navGraph.setNode(finalized.row + TILE_OFFSETS[dir].row, finalized.col + TILE_OFFSETS[dir].col, newNode)
                }
            }
            
            navGraph.propagate(finalized.row, finalized.col)
            finalized = navGraph.finalizeLowest()
        }

        return navGraph
    }
}