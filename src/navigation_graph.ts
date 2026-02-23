import { GridDirections } from "./position"

export class NavigationNode {
    distance: number
    finalized: boolean
    edges: Record<GridDirections, boolean>

    constructor() {
        this.distance = Infinity
        this.finalized = false
        this.edges = {
            [GridDirections.NW]: false,
            [GridDirections.NN]: false,
            [GridDirections.NE]: false,
            [GridDirections.WW]: false,
            [GridDirections.EE]: false,
            [GridDirections.SW]: false,
            [GridDirections.SS]: false,
            [GridDirections.SE]: false
        }
    }
}