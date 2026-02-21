import { Actor } from "./actor"
import { AnimationManager } from "./animation_manager"
import { TilePosition, tileToPixel } from "./position"
import { TextSprite, TILE_SIZE } from "./text_sprite"

export class Entity {
    sprite: TextSprite

    row: number
    col: number

    width: number
    height: number

    hasAI: boolean // TODO: Replace with components!

    actor: Actor
    animationManager: AnimationManager

    constructor(text: string, row: number = 0, col: number = 0, width: number = 1, height: number = 1) {
        this.sprite = new TextSprite(text)
        this.row = row
        this.col = col
        this.width = width
        this.height = height

        this.hasAI = false

        this.actor = new Actor(this)
        this.animationManager = new AnimationManager(this)
        
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(...tileToPixel(this.row, this.col, this.width, this.height))
    }

    setPosition(row: number, col: number) {
        this.row = row
        this.col = col

        this.sprite.position.set(...tileToPixel(this.row, this.col, this.width, this.height))
        // console.log(this.row, this.col)
    }

    tileCollision(row: number, col: number) {
        return (row >= this.row && row < this.row + this.height && col >= this.col && col < this.col + this.width)
    }

    intersectingTiles() {
        const minX = this.sprite.position.x - this.sprite.width / 2
        const minY = this.sprite.position.y - this.sprite.height / 2
        const maxX = this.sprite.position.x + this.sprite.width / 2
        const maxY = this.sprite.position.y + this.sprite.height / 2

        // console.log(minX, minY, maxX, maxY)

        const minRow = Math.floor(minY / TILE_SIZE)
        const minCol = Math.floor(minX / TILE_SIZE)
        const maxRow = maxY % TILE_SIZE === 0 ? Math.floor(maxY / TILE_SIZE) - 1 : Math.floor(maxY / TILE_SIZE)
        const maxCol = maxX % TILE_SIZE === 0 ? Math.floor(maxX / TILE_SIZE) - 1 : Math.floor(maxX / TILE_SIZE)
        // console.log(minRow, minCol, maxRow, maxCol)

        const tiles: TilePosition[] = []
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                tiles.push({row: row, col: col})
            }
        }
        
        // if (tiles.length % 3 === 0) console.log(minX, minY, maxX, maxY, ":", minRow, minCol, maxRow, maxCol)

        return tiles
    }

    tileOverlap(row: number, col: number) {
        const minX = this.sprite.position.x - this.sprite.width / 2
        const minY = this.sprite.position.y - this.sprite.height / 2
        const maxX = this.sprite.position.x + this.sprite.width / 2
        const maxY = this.sprite.position.y + this.sprite.height / 2

        const minRow = minY / TILE_SIZE
        const minCol = minX / TILE_SIZE
        const maxRow = maxY / TILE_SIZE
        const maxCol = maxX / TILE_SIZE

        const minRowBound = Math.max(row, minRow)
        const maxRowBound = Math.min(row + 1, maxRow)
        const minColBound = Math.max(col, minCol)
        const maxColBound = Math.min(col + 1, maxCol)
        
        const rowOverlap = Math.max(maxRowBound - minRowBound, 0)
        const colOverlap = Math.max(maxColBound - minColBound, 0)
        // console.log(row, col, "|", minRow, minCol, maxRow, maxCol, "|", rowOverlap, colOverlap)

        return 1 - Math.min(rowOverlap, colOverlap)
    }
}