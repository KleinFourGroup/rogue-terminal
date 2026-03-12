import { Entity } from "../entity";
import { tileToPixel } from "../position";
import { IEntitySprite } from "../text/entity_sprite"
import { TextSprite } from "../text/text_sprite";

export class MemoryEntity implements IEntitySprite {
    sprite: TextSprite
    row: number
    col: number
    width: number
    height: number

    original: Entity

    constructor(entity: Entity) {
        this.sprite = entity.sprite.clone()
        this.row = entity.row
        this.col = entity.col
        this.width = entity.width
        this.height = entity.height

        this.sprite.anchor.set(0.5)
        this.sprite.position.set(...tileToPixel(this.row, this.col, this.width, this.height))

        this.original = entity
    }

    setPosition(row: number, col: number) {
        this.row = row
        this.col = col

        this.sprite.position.set(...tileToPixel(this.row, this.col, this.width, this.height))
    }

    isUpToDate() {
        return this.row === this.original.row && this.col === this.original.col
    }
}