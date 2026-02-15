import { Actor } from "./actor"
import { AnimationManager } from "./animation_manager"
import { TextSprite, TILE_SIZE } from "./text_sprite"

export function tileToPixel(row: number, col: number, width: number, height: number) {
    return [col * TILE_SIZE + width * TILE_SIZE / 2, row * TILE_SIZE + height * TILE_SIZE / 2]
}

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
}