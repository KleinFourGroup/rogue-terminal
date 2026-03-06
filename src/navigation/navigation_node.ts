import { GridDirection } from "../position"


export class NavigationNode {
    row: number
    col: number
    distance: number
    finalized: boolean
    edges: Record<GridDirection, boolean>
    heapIndex: number | null

    constructor(row: number, col: number) {
        this.row = row
        this.col = col
        this.distance = Infinity
        this.finalized = false
        this.edges = {
            [GridDirection.NW]: false,
            [GridDirection.NN]: false,
            [GridDirection.NE]: false,
            [GridDirection.WW]: false,
            [GridDirection.EE]: false,
            [GridDirection.SW]: false,
            [GridDirection.SS]: false,
            [GridDirection.SE]: false
        }
        this.heapIndex = null
    }

    setEdge(dir: GridDirection, traversible: boolean) {
        this.edges[dir] = traversible
    }
}
