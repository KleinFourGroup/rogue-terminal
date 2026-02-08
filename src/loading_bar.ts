import { Container, Graphics } from "pixi.js"
import { COLORS } from "./colors"

const OUTLINE_WIDTH = 5
const INNER_MARGIN = 5
const INNER_BAR_MINIMUM = 5

export class LoadingBar extends Container {
    progress: number
    
    innerRect: Graphics
    outerRectLeft: Graphics
    outerRectRight: Graphics
    outerRectTop: Graphics
    outerRectBottom: Graphics

    constructor() {
        super()
        this.progress = 0

        this.innerRect = new Graphics().rect(0, 0, 10, 10).fill(COLORS.TERMINAL_GREEN)
        this.innerRect.position.set(OUTLINE_WIDTH + INNER_MARGIN)
        
        
        this.outerRectLeft = new Graphics().rect(0, 0, OUTLINE_WIDTH, OUTLINE_WIDTH).fill(COLORS.TERMINAL_GREEN)
        this.outerRectRight = new Graphics().rect(0, 0, OUTLINE_WIDTH, OUTLINE_WIDTH).fill(COLORS.TERMINAL_GREEN)
        this.outerRectTop = new Graphics().rect(0, 0, OUTLINE_WIDTH, OUTLINE_WIDTH).fill(COLORS.TERMINAL_GREEN)
        this.outerRectBottom = new Graphics().rect(0, 0, OUTLINE_WIDTH, OUTLINE_WIDTH).fill(COLORS.TERMINAL_GREEN)

        this.addChild(this.outerRectLeft)
        this.addChild(this.outerRectRight)
        this.addChild(this.outerRectTop)
        this.addChild(this.outerRectBottom)
        this.addChild(this.innerRect)
    }

    setProgress(progress: number) {
        progress = Math.max(0, Math.min(progress, 1))
        this.progress = progress

        this.innerRect.width = (this.width - 2 *(OUTLINE_WIDTH + INNER_MARGIN)) * this.progress
    }

    setDimensions(width: number, height: number) {
        if (width < 2 * (OUTLINE_WIDTH + INNER_MARGIN) + INNER_BAR_MINIMUM) {
            console.warn(`Loading Bar width too low: ${width} < ${2 * (OUTLINE_WIDTH + INNER_MARGIN) + INNER_BAR_MINIMUM}`)
            width = 2 * (OUTLINE_WIDTH + INNER_MARGIN) + INNER_BAR_MINIMUM
        }
        if (height < 2 * (OUTLINE_WIDTH + INNER_MARGIN) + INNER_BAR_MINIMUM) {
            console.warn(`Loading Bar width too low: ${height} < ${2 * (OUTLINE_WIDTH + INNER_MARGIN) + INNER_BAR_MINIMUM}`)
            height = 2 * (OUTLINE_WIDTH + INNER_MARGIN) + INNER_BAR_MINIMUM
        }

        // left / right edges
        this.outerRectLeft.position.set(0) // Redundant; delete if performance is an issue
        this.outerRectRight.position.set(width - OUTLINE_WIDTH, 0)
        this.outerRectLeft.height = height
        this.outerRectRight.height = height

        // Top / bottom edges
        this.outerRectTop.position.set(OUTLINE_WIDTH, 0)
        this.outerRectBottom.position.set(OUTLINE_WIDTH, height - OUTLINE_WIDTH)
        this.outerRectTop.width = width - 2 * OUTLINE_WIDTH
        this.outerRectBottom.width = width - 2 * OUTLINE_WIDTH

        // Inner rect
        this.innerRect.position.set(OUTLINE_WIDTH + INNER_MARGIN)
        this.innerRect.width = (width - 2 * (OUTLINE_WIDTH + INNER_MARGIN)) * this.progress
        this.innerRect.height = height - 2 * (OUTLINE_WIDTH + INNER_MARGIN)
    }
}