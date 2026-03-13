import { setupAI } from "../behaviors/behavior"
import { RandomMoveTargetAI } from "../behaviors/random_move_target"
import { RandomWalkAI } from "../behaviors/random_walk"
import { CacheManager } from "../cache_manager"
import { Entity } from "../entity"
import { TextSprite } from "../text/text_sprite"
import { FogMemory } from "../visibility/fog_memory"
import { Observer } from "../visibility/observer"
import { World } from "../world"

export function buildLevel(ROWS: number, COLS: number, FOV_DISTANCE: number, caches: CacheManager) {
    const level = new World(ROWS, COLS)

    const player = new Entity("@", caches, Math.floor(ROWS / 2), Math.floor(COLS / 2))
    player.addComponent(new Observer(FOV_DISTANCE))

    level.addEntity(player)
    setupAI(player, new RandomMoveTargetAI(player, level, true, caches.navNodePool)) // Still probably don't want this being called directly

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tile = new TextSprite(".")
            level.setGroundText(row, col, tile)
            level.setValid(row, col, true)

            if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                const wall = new Entity("#", caches, row, col)
                wall.addComponent(new FogMemory(level.memories))
                level.addEntity(wall)
            }
        }
    }

    for (let drow = -1; drow <= 1; drow += 2) {
        for (let dcol = -1; dcol <= 1; dcol += 2) {
            for (let count = 1; count <= 3; count++) {
                const newEntity = new Entity("O", caches, player.row + count * drow, player.col + count * dcol)
                setupAI(newEntity, new RandomWalkAI(newEntity, level, false))
                level.addEntity(newEntity)
            }
        }
    }

    for (let sign = -1; sign <= 1; sign += 2) {
        for (let flip = 0; flip <= 1; flip++) {
            const newEntity = new Entity("G", caches, player.row + 3 * sign * flip - 1, player.col + 3 * sign * (1 - flip) - 1, 3, 3)
            setupAI(newEntity, new RandomWalkAI(newEntity, level, false, 2400))
            level.addEntity(newEntity)
        }
    }

    const offset = 3
    const rows = [offset, ROWS - offset - 1]
    const cols = [offset, COLS - offset - 1]

    for (const row of rows) {
        const rowSub = row === rows[1] ? 0 : -1
        for (const col of cols) {
            const colSub = col === cols[1] ? 0 : -1

            const newEntity = new Entity("D", caches, row + rowSub, col + colSub, 2, 2)
            level.addEntity(newEntity)
            setupAI(newEntity, new RandomMoveTargetAI(newEntity, level, false, caches.navNodePool, 600)) // Still probably don't want this being called directly
        }
    }

    return [level, player] as const
}