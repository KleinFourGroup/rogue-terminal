import { Sprite, Texture } from "pixi.js"
import { COLORS } from "./colors"

export const TILE_SIZE = 64

export class TextSprite extends Sprite {
    character: string
    textureCanvas: HTMLCanvasElement
    textureCtx: CanvasRenderingContext2D

    constructor(character: string) {
        const textureCanvas = document.createElement("canvas")
        textureCanvas.width = TILE_SIZE
        textureCanvas.height = TILE_SIZE
        const textureCtx = textureCanvas.getContext("2d")!

        textureCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE)
        textureCtx.fillStyle = COLORS.TERMINAL_GREEN
        textureCtx.font = "64px serif"
        textureCtx.textBaseline = "middle"
        textureCtx.textAlign = "center"
        textureCtx.fillText(character, TILE_SIZE / 2, TILE_SIZE / 2)

        super(Texture.from(textureCanvas))
        this.character = character
        this.textureCanvas = textureCanvas
        this.textureCtx = textureCtx
    }
}