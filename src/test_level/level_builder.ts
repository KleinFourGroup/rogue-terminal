import { Actor } from "../actor"
import { setupAI } from "../behaviors/behavior"
import { PatrolAI } from "../behaviors/patrol"
import { PlayerMoveTargetAI } from "../behaviors/player_move_target"
import { RandomMoveTargetAI } from "../behaviors/random_move_target"
import { RandomWalkAI } from "../behaviors/random_walk"
import { CacheManager } from "../cache_manager"
import { COLORS } from "../colors"
import { Entity } from "../entity"
import { TilePosition } from "../position"
import { TextSprite } from "../text/text_sprite"
import { FogMemory } from "../visibility/fog_memory"
import { Observer } from "../visibility/observer"
import { World } from "../world"

function buildRoom(level: World, caches: CacheManager, ROOM_ROW: number, ROOM_COL: number, ROOM_SIZE: number) {
    const BASE_ROW = ROOM_ROW * (ROOM_SIZE + 1)
    const BASE_COL = ROOM_COL * (ROOM_SIZE + 1)
    const MIDPOINT = 1 + Math.floor(ROOM_SIZE / 2)

    for (let row = BASE_ROW; row <= BASE_ROW + ROOM_SIZE + 1; row++) {
        for (let col = BASE_COL; col <= BASE_COL + ROOM_SIZE + 1; col++) {
            level.setGroundColor(row, col, COLORS.DARK_TERMINAL_GREEN)
        }
    }

    for (let row = BASE_ROW; row <= BASE_ROW + ROOM_SIZE + 1; row++) {
        for (let col = BASE_COL; col <= BASE_COL + ROOM_SIZE + 1; col += (row === BASE_ROW || row === BASE_ROW + ROOM_SIZE + 1) ? 1 : ROOM_SIZE + 1) {
            if (Math.abs(BASE_ROW + MIDPOINT - row) > 1 && Math.abs(BASE_COL + MIDPOINT - col) > 1 && level.isNavigable(row, col)){
                const wall = new Entity("#", caches, row, col)
                wall.addComponent(new FogMemory(level.memories))
                level.addEntity(wall)
            }
        }
    }
}

function placeSentry(level: World, caches: CacheManager, ROOM_ROW: number, ROOM_COL: number, ROOM_SIZE: number) {
    const BASE_ROW = ROOM_ROW * (ROOM_SIZE + 1)
    const BASE_COL = ROOM_COL * (ROOM_SIZE + 1)
    const MIDPOINT = 1 + Math.floor(ROOM_SIZE / 2)
    
    if (level.isNavigable(BASE_ROW + MIDPOINT, BASE_COL + MIDPOINT)) {
        const newEntity = new Entity("S", caches, BASE_ROW + MIDPOINT, BASE_COL + MIDPOINT)
        newEntity.addComponent(new Observer(1))
        level.addEntity(newEntity)
    }
}

function placeOrcs(level: World, caches: CacheManager, ROOM_ROW: number, ROOM_COL: number, ROOM_SIZE: number) {
    const BASE_ROW = ROOM_ROW * (ROOM_SIZE + 1)
    const BASE_COL = ROOM_COL * (ROOM_SIZE + 1)
    const MIDPOINT = 1 + Math.floor(ROOM_SIZE / 2)

    for (let drow = -1; drow <= 1; drow += 2) {
        for (let dcol = -1; dcol <= 1; dcol += 2) {
            for (let count = 1; count <= 3; count++) {
                const newEntity = new Entity("O", caches, BASE_ROW + MIDPOINT + count * drow, BASE_COL + MIDPOINT + count * dcol)
                newEntity.addComponent(new Actor(newEntity))
                setupAI(newEntity, new RandomWalkAI(newEntity, level, false))
                level.addEntity(newEntity)
            }
        }
    }
}

function placeGiants(level: World, caches: CacheManager, ROOM_ROW: number, ROOM_COL: number, ROOM_SIZE: number) {
    const BASE_ROW = ROOM_ROW * (ROOM_SIZE + 1)
    const BASE_COL = ROOM_COL * (ROOM_SIZE + 1)
    const MIDPOINT = 1 + Math.floor(ROOM_SIZE / 2)

    for (let sign = -1; sign <= 1; sign += 2) {
        for (let flip = 0; flip <= 1; flip++) {
            const newEntity = new Entity("G", caches, BASE_ROW + MIDPOINT + 3 * sign * flip - 1, BASE_COL + MIDPOINT + 3 * sign * (1 - flip) - 1, 3, 3)
            newEntity.addComponent(new Actor(newEntity))
            setupAI(newEntity, new RandomWalkAI(newEntity, level, false, 2400))
            level.addEntity(newEntity)
        }
    }
}

function placeDogs(level: World, caches: CacheManager, ROOM_ROW: number, ROOM_COL: number, ROOM_SIZE: number) {
    const BASE_ROW = ROOM_ROW * (ROOM_SIZE + 1)
    const BASE_COL = ROOM_COL * (ROOM_SIZE + 1)

    const offset = 3
    const rows = [BASE_ROW + offset, BASE_ROW + ROOM_SIZE - offset + 1]
    const cols = [BASE_COL + offset, BASE_COL + ROOM_SIZE - offset + 1]

    for (const row of rows) {
        const rowSub = row === rows[1] ? 0 : -1
        for (const col of cols) {
            const colSub = col === cols[1] ? 0 : -1

            const newEntity = new Entity("D", caches, row + rowSub, col + colSub, 2, 2)
            newEntity.addComponent(new Actor(newEntity))
            level.addEntity(newEntity)
            setupAI(newEntity, new RandomMoveTargetAI(newEntity, level, false, caches.navNodePool, 600)) // Still probably don't want this being called directly
        }
    }
}

function placePatrol(level: World, caches: CacheManager, ROOM_ROW: number, ROOM_COL: number, ROOM_SIZE: number) {
    const BASE_ROW = ROOM_ROW * (ROOM_SIZE + 1)
    const BASE_COL = ROOM_COL * (ROOM_SIZE + 1)

    const offset = 3
    const tiles: TilePosition[] = [
        {row: BASE_ROW + offset, col: BASE_COL + offset},
        {row: BASE_ROW + offset, col: BASE_COL + ROOM_SIZE - offset + 1},
        {row: BASE_ROW + ROOM_SIZE - offset + 1, col: BASE_COL + ROOM_SIZE - offset + 1},
        {row: BASE_ROW + ROOM_SIZE - offset + 1, col: BASE_COL + offset},
    ]

    for (const tile of tiles) {
        const start = tiles.indexOf(tile)
        const targets = [
            ...tiles.slice(start),
            ...tiles.slice(0, start)
        ]

        const newEntity = new Entity("P", caches, tile.row, tile.col, 1, 1)
        newEntity.addComponent(new Actor(newEntity))
        level.addEntity(newEntity)
        setupAI(newEntity, new PatrolAI(newEntity, level, targets, caches.navNodePool, 1200)) // Still probably don't want this being called directly
    }
}

export function buildLevel(ROOM_ROWS: number, ROOM_COLS: number, ROOM_SIZE: number, FOV_DISTANCE: number, caches: CacheManager) {
    const ROWS = ROOM_ROWS * (ROOM_SIZE + 1) + 1
    const COLS = ROOM_COLS * (ROOM_SIZE + 1) + 1
    const level = new World(ROWS, COLS)

    const player = new Entity("@", caches, Math.floor(ROWS / 2), Math.floor(COLS / 2))
    player.addComponent(new Actor(player))
    player.addComponent(new Observer(FOV_DISTANCE))

    level.addEntity(player)
    setupAI(player, new PlayerMoveTargetAI(player, level, true, caches.navNodePool)) // Still probably don't want this being called directly

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

    for (let row = 0; row < ROOM_ROWS; row++) {
        for (let col = 0; col < ROOM_COLS; col++) {
            buildRoom(level, caches, row, col, ROOM_SIZE)
            placeSentry(level, caches, row, col, ROOM_SIZE)
        }
    }

    placePatrol(level, caches, 1, 1, ROOM_SIZE)

    placeOrcs(level, caches, 0, 1, ROOM_SIZE)
    placeOrcs(level, caches, 2, 1, ROOM_SIZE)

    placeGiants(level, caches, 1, 0, ROOM_SIZE)
    placeGiants(level, caches, 1, 2, ROOM_SIZE)

    placeDogs(level, caches, 0, 0, ROOM_SIZE)
    placeDogs(level, caches, 0, 2, ROOM_SIZE)
    placeDogs(level, caches, 2, 0, ROOM_SIZE)
    placeDogs(level, caches, 2, 2, ROOM_SIZE)

    return [level, player] as const
}