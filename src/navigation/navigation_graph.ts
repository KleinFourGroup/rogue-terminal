import { DIRS, GridDirection, TILE_OFFSETS, TilePosition, toFlatArrayOffsets } from "../position"
import { NavigationNode } from "./navigation_node"
import { NavigationHeap } from "./navigation_heap"
import { NodePool } from "./node_pool"

export class NavigationGrid {
    rows: number
    cols: number
    zeroTiles: TilePosition[]
    tiles: (NavigationNode | null)[]
    heap: NavigationHeap

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols
        this.zeroTiles = []
        this.tiles = new Array(this.rows * this.cols).fill(null)
        this.heap = new NavigationHeap()
    }
    
    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    hasNode(row: number, col: number) {
        console.assert(this.isInBounds(row, col))
        return this.tiles[row * this.cols + col] !== null
    }

    setNode(row: number, col: number, node: NavigationNode) {
        console.assert(node.row === row && node.col === col)
        console.assert(this.tiles[row * this.cols + col] === null)
        console.assert(!node.finalized)
        this.tiles[row * this.cols + col] = node
        this.heap.push(node)
    }

    finalizeLowest() {
        const lowest = this.heap.pop()

        if (lowest !== null) {
            console.assert(Number.isFinite(lowest.distance))
            lowest.finalized = true
            
            if (lowest.distance === 0) {
                this.zeroTiles.push({row: lowest.row, col: lowest.col})
            }
        }

        return lowest
    }

    propagate(row: number, col: number) {
        const node = this.tiles[row * this.cols + col]
        console.assert(node !== null)
        console.assert(node!.finalized)

        for (const dir of DIRS) {
            if (node!.edges[dir]) {
                console.assert(this.isInBounds(row + TILE_OFFSETS[dir].row, col + TILE_OFFSETS[dir].col))
                const neighbor = this.tiles[row * this.cols + col + toFlatArrayOffsets(TILE_OFFSETS[dir], this.cols)]
                console.assert(neighbor !== null)
                if (!neighbor!.finalized) {
                    neighbor!.distance = Math.min(node!.distance + 1, neighbor!.distance)

                    if (neighbor!.heapIndex === null) {
                        this.heap.push(neighbor!)
                    } else {
                        this.heap.upheap(neighbor!.heapIndex) // Kinda ugly, but it works
                    }
                }
            }
        }
    }

    zeroCartesian(row: number, col: number) {
        let minCart = Infinity
        for (const tile of this.zeroTiles) {
            minCart = Math.min(minCart, (tile.row - row) ** 2 + (tile.col - col) ** 2)
        }

        return minCart
    }

    navigate(row: number, col: number, momentum: TilePosition | null = null): TilePosition | null {
        const node = this.tiles[row * this.cols + col]
        // It's not navigable
        if (node === null) {
            return null
        }

        console.assert(node.finalized)

        const nextData = {
            dir: null as GridDirection | null,
            dist: node.distance,
            cartDist: Infinity,
            dotP: -Infinity
        }

        function setNext(dir: GridDirection, distance: number, cartesian: number, dotProduct: number) {
            nextData.dir = dir
            nextData.dist = distance
            nextData.cartDist = cartesian
            nextData.dotP = dotProduct
        }

        for (const dir of DIRS) {
            if (node.edges[dir]) {
                console.assert(this.isInBounds(row + TILE_OFFSETS[dir].row, col + TILE_OFFSETS[dir].col))
                const neighbor = this.tiles[row * this.cols + col + toFlatArrayOffsets(TILE_OFFSETS[dir], this.cols)]
                console.assert(neighbor !== null)

                const distance = neighbor!.distance
                const cartesian = this.zeroCartesian(row + TILE_OFFSETS[dir].row, col + TILE_OFFSETS[dir].col)
                const dotProduct = momentum !== null ? (momentum.row * TILE_OFFSETS[dir].row + momentum.col * TILE_OFFSETS[dir].col) : -Infinity
                
                if (distance < nextData.dist) {
                    setNext(dir, distance, cartesian, dotProduct)
                } else if (distance === nextData.dist) {
                    if (cartesian < nextData.cartDist) {
                        setNext(dir, distance, cartesian, dotProduct)
                    } else if (cartesian === nextData.cartDist && momentum !== null) {
                        if (dotProduct > nextData.dotP) {
                            setNext(dir, distance, cartesian, dotProduct)
                        }
                    }
                }
            }
        }

        if (nextData.dir === null) {
            return null
        }

        return {
            row: row + TILE_OFFSETS[nextData.dir].row,
            col: col + TILE_OFFSETS[nextData.dir].col
        }
    }

    freeNodes(pool: NodePool) {
        for (const node of this.tiles) {
            if (node !== null) {
                pool.freeNode(node)
            }
        }
    }
}