import { Container, Graphics } from "pixi.js"
import { TextSprite, TILE_SIZE } from "./text_sprite"

export class BackgroundGrid extends Container {
    rows: number
    cols: number

    textArray: (TextSprite | null)[]
    colorArray: (Graphics | null)[]
    highlightArray: (Graphics | null)[]
    validArray: boolean[]

    textLayer: Container
    highlightLayer: Container
    colorLayer: Container

    adjustedAlphas: number[]

    constructor(rows: number, cols: number) {
        super()
        this.rows = rows
        this.cols = cols

        this.textArray = new Array<TextSprite | null>(this.rows * this.cols).fill(null)
        this.colorArray = new Array<Graphics | null>(this.rows * this.cols).fill(null)
        this.highlightArray = new Array<Graphics | null>(this.rows * this.cols).fill(null)
        this.validArray = new Array<boolean>(this.rows * this.cols).fill(false)

        this.textLayer = new Container()
        this.highlightLayer = new Container()
        this.colorLayer = new Container()

        this.adjustedAlphas = []

        this.addChild(this.colorLayer)
        this.addChild(this.highlightLayer)
        this.addChild(this.textLayer)
    }

    isInBounds(row: number, col: number) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    isValid(row: number, col: number) {
        if (this.isInBounds(row, col)) {
            return this.validArray[row * this.cols + col]
        }

        return false
    }

    setValid(row: number, col: number, valid: boolean = true) {
        if (this.isInBounds(row, col)) {
            this.validArray[row * this.cols + col] = valid
        }
    }

    getText(row: number, col: number) {
        if (this.isInBounds(row, col)) {
            return this.textArray[row * this.cols + col]
        }

        return null
    }

    setText(row: number, col: number, sprite: TextSprite) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col
            this.textArray[index] = sprite
            this.textLayer.addChild(sprite)

            sprite.position.set(col * TILE_SIZE, row * TILE_SIZE)

            // Hideous insert sort, but in theory this should only be done once anyways, so...
            const laterChildren = this.textArray.filter((val, ind) => ind > index && val !== null) as TextSprite[]
            for (const child of laterChildren) {
                this.textLayer.removeChild(child)
                this.textLayer.addChild(child)
            }
        }
    }

    getColor(row: number, col: number) {
        if (this.isInBounds(row, col)) {
            return this.colorArray[row * this.cols + col]
        }

        return null
    }

    setColor(row: number, col: number, color: string) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col

            if (this.colorArray[index] !== null) {
                const graphics = this.colorArray[index]
                graphics.clear()
                graphics.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color)
            } else {
                const graphics =  new Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color)
                this.colorArray[index] = graphics
                this.colorLayer.addChild(graphics)
                
                graphics.position.set(col * TILE_SIZE, row * TILE_SIZE)

                // Hideous insert sort, but in theory this should only be done once anyways, so...
                const laterChildren = this.colorArray.filter((val, ind) => ind > index && val !== null) as Graphics[]
                for (const child of laterChildren) {
                    this.colorLayer.removeChild(child)
                    this.colorLayer.addChild(child)
                }
            }
        }
    }

    setHighlight(row: number, col: number, color: string | null) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col

            if (this.highlightArray[index] !== null) {
                const graphics = this.highlightArray[index]
                graphics.clear()
                if (color !== null) {
                    graphics.roundRect(0, 0, TILE_SIZE, TILE_SIZE, TILE_SIZE / 4).stroke({width: 5, color: color})
                }
            } else if (color !== null) {
                const graphics =  new Graphics().roundRect(0, 0, TILE_SIZE, TILE_SIZE, TILE_SIZE / 4).stroke({width: 5, color: color})
                this.highlightArray[index] = graphics
                this.highlightLayer.addChild(graphics)
                
                graphics.position.set(col * TILE_SIZE, row * TILE_SIZE)

                // Hideous insert sort, but in theory this should only be done once anyways, so...
                const laterChildren = this.highlightArray.filter((val, ind) => ind > index && val !== null) as Graphics[]
                for (const child of laterChildren) {
                    this.highlightLayer.removeChild(child)
                    this.highlightLayer.addChild(child)
                }
            }
        }
    }

    setAlpha(row: number, col: number, alpha: number) {
        if (this.isInBounds(row, col)) {
            const index = row * this.cols + col

            const textSprite = this.textArray[index]
            if (textSprite !== null) {
                textSprite.alpha = Math.min(alpha, textSprite.alpha)
                this.adjustedAlphas.push(index)
            }
        }
    }

    clearAlphas() {
        for (const index of this.adjustedAlphas) {
            this.textArray[index]!.alpha = 1
        }

        if (this.adjustedAlphas.length > 0) {
            this.adjustedAlphas.splice(0, this.adjustedAlphas.length)
        }
    }
}