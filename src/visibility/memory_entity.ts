import { Entity } from "../entity";
import { tileToPixel } from "../position";
import { IEntitySprite } from "../text/entity_sprite"
import { TextSprite } from "../text/text_sprite";
import { TILE_SIZE } from "../text/canvas_style";
import { AnimationLayer, LayerCompositor } from "../animation/layers";

export class MemoryEntity implements IEntitySprite {
    sprite: TextSprite
    compositor: LayerCompositor
    row: number
    col: number
    width: number
    height: number

    original: Entity

    constructor(entity: Entity) {
        this.sprite = entity.sprite.clone()
        this.compositor = new LayerCompositor()
        this.row = entity.row
        this.col = entity.col
        this.width = entity.width
        this.height = entity.height

        this.sprite.anchor.set(0.5)
        const [x, y] = tileToPixel(0, 0, this.width, this.height)
        this.compositor.setVector(AnimationLayer.BASE, x, y)
        this.compositor.setVector(AnimationLayer.LOCATION, this.col * TILE_SIZE, this.row * TILE_SIZE)
        this.compose()

        this.original = entity
    }

    compose() {
        const position = this.compositor.compose()
        this.sprite.position.set(position.x, position.y)
    }

    setPosition(row: number, col: number, forceDraw: boolean = false) {
        this.row = row
        this.col = col

        if (forceDraw) {
            this.compositor.setVector(AnimationLayer.LOCATION, this.col * TILE_SIZE, this.row * TILE_SIZE)
            this.compose()
        }
    }

    isUpToDate() {
        return this.row === this.original.row && this.col === this.original.col
    }
}