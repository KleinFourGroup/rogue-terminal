import { GridDirection, TILE_OFFSETS, TilePosition, toFlatArrayOffsets } from "./position"

export class NavigationNode {
    row: number
    col: number
    distance: number
    finalized: boolean
    edges: Record<GridDirection, boolean>

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
    }

    setEdge(dir: GridDirection, traversible: boolean) {
        this.edges[dir] = traversible
    }
}

export class NavigationGrid {
    rows: number
    cols: number
    zeroTiles: TilePosition[]
    tiles: (NavigationNode | null)[]
    queue: NavigationNode[]

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols
        this.zeroTiles = []
        this.tiles = new Array(this.rows * this.cols).fill(null)
        this.queue = []
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
        this.queue.push(node)
    }

    finalizeLowest() {
        if (this.queue.length === 0) {
            return null
        }

        // Sort the queue
        this.queue.sort((nodeA, nodeB) => {
            if (!Number.isFinite(nodeB.distance)) {
                return Number.isFinite(nodeA.distance) ? -1 : 0
            }
            return Number.isFinite(nodeA.distance) ? nodeA.distance - nodeB.distance : 1
        })

        const lowest = this.queue.shift()!
        console.assert(Number.isFinite(lowest.distance))
        lowest.finalized = true
        
        if (lowest.distance === 0) {
            this.zeroTiles.push({row: lowest.row, col: lowest.col})
        }

        return lowest
    }

    propagate(row: number, col: number) {
        const node = this.tiles[row * this.cols + col]
        console.assert(node !== null)
        console.assert(node!.finalized)

        const dirs = Object.values(GridDirection).filter((val) => typeof val === "number")
        for (const dir of dirs) {
            if (node!.edges[dir]) {
                console.assert(this.isInBounds(row + TILE_OFFSETS[dir].row, col + TILE_OFFSETS[dir].col))
                const neighbor = this.tiles[row * this.cols + col + toFlatArrayOffsets(TILE_OFFSETS[dir], this.cols)]
                console.assert(neighbor !== null)
                if (!neighbor!.finalized) {
                    neighbor!.distance = Math.min(node!.distance + 1, neighbor!.distance)

                    if (this.queue.indexOf(neighbor!) === -1) {
                        this.queue.push(neighbor!)
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
        console.assert(node !== null)
        console.assert(node!.finalized)

        const dirs = Object.values(GridDirection).filter((val) => typeof val === "number")

        const nextData = {
            dir: null as GridDirection | null,
            dist: node!.distance,
            cartDist: Infinity,
            dotP: -Infinity
        }

        function setNext(dir: GridDirection, distance: number, cartesian: number, dotProduct: number) {
            nextData.dir = dir
            nextData.dist = distance
            nextData.cartDist = cartesian
            nextData.dotP = dotProduct
        }

        for (const dir of dirs) {
            if (node!.edges[dir]) {
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
}