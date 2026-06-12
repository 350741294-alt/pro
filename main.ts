namespace SpriteKind {
    export const AlienScout = SpriteKind.create()
    export const ScrapMetal = SpriteKind.create()
    export const SpaceMine = SpriteKind.create()
}
/**
 * Game State Architecture
 */
function checkHullDamage(threat: Sprite) {
    threat.destroy(effects.fire, 250)
    scene.cameraShake(6, 400)
    music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
    info.changeLifeBy(-1)
}
// ============================================================================
// --- 🔫 2. MODERNIZED WEAPON SYSTEMS (ULTRA COOL LASERS) ---
// ============================================================================
function fireLaser(xOffset: number, vx: number, vy: number) {
    // REMODELED BULLETS: Custom state-of-the-art neon plasma designs!
    if (weaponLevel == 1) {
        // LEVEL 1: Dual-Core Ion Spike (Sleek cyan and white laser point)
        projectileImg = img`
            . . 1 . . 
            . 6 9 6 . 
            . 6 9 6 . 
            . 6 9 6 . 
            . . 1 . . 
            `
    } else if (weaponLevel == 2) {
        // LEVEL 2: Heavy Proton Shell (Thick glowing red blast line with a hot core)
        projectileImg = img`
            . . 2 2 . . 
            . 2 f f 2 . 
            2 f 4 4 f 2 
            2 f 4 4 f 2 
            . 2 f f 2 . 
            . . 2 2 . . 
            `
    } else {
        // LEVEL 3+: Hyper-Charged Golden Cross-Bolt Star Projectile (Ultimate Variant)
        projectileImg = img`
            . . . 5 . . . 
            . . 5 f 5 . . 
            . 5 5 4 5 5 . 
            5 f 4 5 4 f 5 
            . 5 5 4 5 5 . 
            . . 5 f 5 . . 
            . . . 5 . . . 
            `
    }
    laser = sprites.createProjectileFromSide(projectileImg, vx, vy)
    laser.setPosition(playerShip.x + xOffset, playerShip.y - 6)
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (warpSequenceActive || showIntroBanner) {
        return
    }
    if (empCharge >= maxEmp) {
        empCharge = 0
        music.play(music.melodyPlayable(music.jumpUp), music.PlaybackMode.UntilDone)
        scene.cameraShake(8, 500)
        enemies = sprites.allOfKind(SpriteKind.Enemy)
        aliens = sprites.allOfKind(SpriteKind.AlienScout)
        mines = sprites.allOfKind(SpriteKind.SpaceMine)
        for (let target of enemies) {
            target.destroy(effects.disintegrate, 300)
        }
        for (let target2 of aliens) {
            target2.destroy(effects.disintegrate, 300)
        }
        for (let target3 of mines) {
            target3.destroy(effects.disintegrate, 300)
        }
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.AlienScout, function (player2, alien) {
    checkHullDamage(alien)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (warpSequenceActive || showIntroBanner) {
        return
    }
    if (isOverheated) {
        music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.UntilDone)
        return
    }
    if (weaponLevel == 1) {
        fireLaser(0, 0, -180)
        weaponHeat += 12
    } else if (weaponLevel == 2) {
        fireLaser(-6, 0, -180)
        fireLaser(6, 0, -180)
        weaponHeat += 18
    } else if (weaponLevel >= 3) {
        fireLaser(0, 0, -180)
        fireLaser(-6, -40, -170)
        fireLaser(6, 40, -170)
        weaponHeat += 25
    }
    music.play(music.melodyPlayable(music.pewPew), music.PlaybackMode.InBackground)
    if (weaponHeat >= 100) {
        isOverheated = true
    }
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.SpaceMine, function (laser, mine) {
    destroyEnemyWithReward(laser, mine, 15, 2)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (player2, meteor) {
    checkHullDamage(meteor)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (laser, meteor) {
    destroyEnemyWithReward(laser, meteor, 10, 1)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.SpaceMine, function (player2, mine) {
    checkHullDamage(mine)
})
// ============================================================================
// --- 5. COLLISION MATRIX ---
// ============================================================================
function destroyEnemyWithReward(laser: Sprite, enemy: Sprite, scoreGained: number, empGained: number) {
    laser.destroy()
    enemy.destroy(effects.disintegrate, 150)
    info.changeScoreBy(scoreGained)
    empCharge = Math.min(empCharge + empGained, maxEmp)
    if (randint(1, 100) <= 25) {
        scrap = sprites.create(img`
            . . . . . . . . 
            . . . 5 5 . . . 
            . . 5 c c 5 . . 
            . 5 c c c c 5 . 
            . . . 5 5 . . . 
            `, SpriteKind.ScrapMetal)
        scrap.setPosition(enemy.x, enemy.y)
        scrap.vy = 40
    }
}
// ============================================================================
// --- 🛒 6. THE SCRAP SHOP UPGRADE MENU ---
// ============================================================================
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (warpSequenceActive || showIntroBanner) {
        return
    }
    shopText = "SCRAP: " + scrapInventory + " | WP: " + weaponLevel + " -> 1:Wpn(5s) 2:Hull(3s) 3:Cool(2s)"
    choice = game.askForString(shopText, 1)
    if (choice == "1") {
        if (scrapInventory >= 5) {
            scrapInventory += 0 - 5
            weaponLevel += 1
            game.splash("⚡ SYSTEM OVERCLOCKED ⚡")
        } else {
            game.splash("❌ INSUFFICIENT MATERIALS ❌")
        }
    } else if (choice == "2") {
        if (scrapInventory >= 3) {
            scrapInventory += 0 - 3
            info.changeLifeBy(1)
            game.splash("🛡️ HULL INTEGRITY SECURED 🛡️")
        } else {
            game.splash("❌ INSUFFICIENT MATERIALS ❌")
        }
    } else if (choice == "3") {
        if (scrapInventory >= 2) {
            scrapInventory += 0 - 2
            coolingRate += 1
            game.splash("❄️ VENT CORES UPGRADED ❄️")
        } else {
            game.splash("❌ INSUFFICIENT MATERIALS ❌")
        }
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.ScrapMetal, function (player2, scrap) {
    scrap.destroy()
    scrapInventory += 1
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.AlienScout, function (laser, alien) {
    destroyEnemyWithReward(laser, alien, 25, 3)
})
let mine: Sprite = null
let alien2: Sprite = null
let meteor: Sprite = null
let rolloutChance = 0
let speedScalar = 0
let mines2: Sprite[] = []
let scouts: Sprite[] = []
let evils: Sprite[] = []
let lateralSpeed = 0
let activeAliens: Sprite[] = []
let warpTimer = 0
let choice = ""
let scrapInventory = 0
let shopText = ""
let scrap: Sprite = null
let mines: Sprite[] = []
let aliens: Sprite[] = []
let enemies: Sprite[] = []
let laser: Sprite = null
let projectileImg: Image = null
let showIntroBanner = false
let maxEmp = 0
let weaponLevel = 0
let playerShip: Sprite = null
let warpSequenceActive = false
let empCharge = 0
let isOverheated = false
let weaponHeat = 0
// ============================================================================
// --- 🛸 1. CORE ENGINE CONFIGURATION & GLOBAL STATE ---
// ============================================================================
effects.starField.startScreenEffect()
// STATE OF THE ART: Futuristic, sleek glowing-neon stealth dreadnought ship!
playerShip = sprites.create(img`
    . . . . . . . 5 . . . . . . . 
    . . . . . . 5 5 5 . . . . . . 
    . . . . . . 5 f 5 . . . . . . 
    . . . . . 8 5 f 5 8 . . . . . 
    . . . . . 8 d f d 8 . . . . . 
    . . . . 8 d d d d d 8 . . . . 
    . . . . 8 d 6 6 6 d 8 . . . . 
    . . . 9 8 6 6 6 6 6 8 9 . . . 
    . . 9 9 8 6 1 1 1 6 8 9 9 . . 
    . 9 6 6 8 1 1 f 1 1 8 6 6 9 . 
    9 6 f f 8 1 f f f 1 8 f f 6 9 
    9 f f 8 8 f 5 5 5 f 8 8 f f 9 
    8 8 8 2 2 5 4 4 4 5 2 2 8 8 8 
    . . . 2 2 4 e e e 4 2 2 . . . 
    . . . . . 4 e . e 4 . . . . . 
    . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
playerShip.setPosition(80, 110)
controller.moveSprite(play
