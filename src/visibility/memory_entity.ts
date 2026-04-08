import { Container } from "pixi.js";
import { Entity } from "../entity";
import { tileToPixel } from "../position";
import { IEntitySprite } from "../text/entity_sprite"
import { TextSprite } from "../text/text_sprite";
import { TILE_SIZE } from "../text/canvas_style";

export class MemoryEntity implements IEntitySprite {
    sprite: TextSprite
    graphics: Container
    row: number
    col: number
    width: number
    height: number

    original: Entity

    constructor(entity: Entity) {
        this.sprite = entity.sprite.clone()
        this.graphics = new Container()
        this.row = entity.row
        this.col = entity.col
        this.width = entity.width
        this.height = entity.height

        this.sprite.anchor.set(0.5)
        this.sprite.position.set(...tileToPixel(0, 0, this.width, this.height))

        this.graphics.addChild(this.sprite)
        this.graphics.position.set(this.col * TILE_SIZE, this.row * TILE_SIZE)

        this.original = entity
    }

    setPosition(row: number, col: number, forceDraw: boolean = false) {
        this.row = row
        this.col = col

        if (forceDraw) {
            this.sprite.position.set(...tileToPixel(0, 0, this.width, this.height))
            this.graphics.position.set(this.col * TILE_SIZE, this.row * TILE_SIZE)
        }
    }

    isUpToDate() {
        return this.row === this.original.row && this.col === this.original.col
    }
}