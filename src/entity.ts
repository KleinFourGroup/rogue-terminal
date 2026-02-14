import { Actor } from "./actor";
import { AnimationManager } from "./animation_manager";
import { TextSprite, TILE_SIZE } from "./text_sprite";

export class Entity {
    sprite: TextSprite

    row: number
    col: number

    width: number
    height: number

    actor: Actor
    animationManager: AnimationManager

    constructor(text: string, row: number = 0, col: number = 0, width: number = 1, height: number = 1) {
        this.sprite = new TextSprite(text)
        this.row = row
        this.col = col
        this.width = width
        this.height = height

        this.actor = new Actor(this)
        this.animationManager = new AnimationManager(this)
        
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(this.col * TILE_SIZE + this.width * TILE_SIZE / 2, this.row * TILE_SIZE + this.height * TILE_SIZE / 2)
    }

    setPosition(row: number, col: number) {
        this.row = row
        this.col = col

        this.sprite.position.set(this.col * TILE_SIZE + this.width * TILE_SIZE / 2, this.row * TILE_SIZE + this.height * TILE_SIZE / 2)
        // console.log(this.row, this.col)
    }

    tileCollision(row: number, col: number) {
        return (row >= this.row && row < this.row + this.height && col >= this.col && col < this.col + this.width)
    }
}