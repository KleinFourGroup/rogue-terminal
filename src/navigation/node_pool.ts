import { DIRS } from "../position"
import { NavigationNode } from "./navigation_node"


export class NodePool {
    nodes: NavigationNode[]

    constructor() {
        this.nodes = []
    }

    getNode(row: number, col: number) {
        if (this.nodes.length === 0) {
            return new NavigationNode(row, col)
        }

        const node = this.nodes.pop()!

        node.row = row
        node.col = col
        node.distance = Infinity
        node.finalized = false
        node.heapIndex = null

        for (const dir of DIRS) {
            node.edges[dir] = false
        }

        return node
    }

    freeNode(node: NavigationNode) {
        this.nodes.push(node)
    }
}
