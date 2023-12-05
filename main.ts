namespace SpriteKind {
    export const enemy_projectile = SpriteKind.create()
    export const centre = SpriteKind.create()
    export const boss = SpriteKind.create()
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (powerup_bar.value == powerup_bar.max) {
        powerup_overheated = true
        powerup_bar.value = 0
        powerup_bar.setColor(2, 2)
        launch_angle = 0
        for (let index = 0; index < 2; index++) {
            for (let index = 0; index < 18; index++) {
                launch_angle += 10
                fire_at_angle(launch_angle)
            }
            for (let index = 0; index < 18; index++) {
                launch_angle += -10
                fire_at_angle(launch_angle)
            }
        }
        powerup_cooldown()
    }
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (projectile, enemy) {
    shield_count = sprites.allOfKind(SpriteKind.Food).length
    if (randint(1, 10) == 1 && shield_count < 1) {
        shield = sprites.create(assets.image`shield falling`, SpriteKind.Food)
        shield.setPosition(enemy.x, enemy.y)
        shield.setVelocity(0, 50)
        shield.setFlag(SpriteFlag.AutoDestroy, true)
    }
    if (!(powerup_overheated)) {
        powerup_bar.value += 5
    }
    info.changeScoreBy(100)
    projectile.destroy()
    enemy.destroy(effects.fire, 100)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    projectile = sprites.createProjectileFromSprite(assets.image`player projectile`, ship, 0, player_shot_speed)
})
function enemy_behaviour () {
    for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
        if (randint(0, 250) == 0) {
            enemy_fire(enemy)
        }
        update_enemy_position(enemy, formation_center)
    }
}
function player_movement () {
    if (controller.left.isPressed()) {
        ship.vx += player_speed * -1
    }
    if (controller.right.isPressed()) {
        ship.vx += player_speed
    }
    ship.vx = ship.vx * deceleration
}
function powerup_cooldown () {
    pause(5000)
    powerup_overheated = false
    powerup_bar.setColor(8, 11)
    music.play(music.melodyPlayable(music.jumpUp), music.PlaybackMode.InBackground)
}
function enemy_fire (enemy: Sprite) {
    proj = sprites.createProjectileFromSprite(assets.image`enemy projectile`, enemy, 0, enemy_shot_speed)
    proj.setKind(SpriteKind.enemy_projectile)
    music.pewPew.play()
}
function fire_at_angle (angle: number) {
    projectile = sprites.createProjectileFromSprite(assets.image`player projectile`, ship, 0, 0)
    spriteutils.setVelocityAtAngle(projectile, spriteutils.degreesToRadians(angle), player_shot_speed)
    music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
    pause(20)
}
function player_hit (player2: Sprite, enemy: Sprite) {
    info.changeLifeBy(-1)
    enemy.destroy()
}
function update_enemy_position (enemy: Sprite, formation_center: Sprite) {
    x_offset = sprites.readDataNumber(enemy, "x_offset")
    y_offset = sprites.readDataNumber(enemy, "y_offset")
    enemy.vx = formation_center.x + x_offset - enemy.x
    enemy.vy = formation_center.y + y_offset - enemy.y
}
function constrain_formation_position () {
    if (formation_center.x < 70) {
        formation_center.vx = randint(5, 10)
    }
    if (formation_center.x > 90) {
        formation_center.vx = randint(-5, -10)
    }
    if (formation_center.y < 55) {
        formation_center.vy = randint(5, 10)
    }
    if (formation_center.y > 65) {
        formation_center.vy = randint(-5, -10)
    }
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.enemy_projectile, function (sprite, otherSprite) {
    player_hit(sprite, otherSprite)
})
function spawn_enemy (start_x: number, start_y: number) {
    enemy = sprites.create(assets.image`enemy ship 1`, SpriteKind.Enemy)
    if (randint(1, 2) == 2) {
        enemy.setImage(assets.image`enemy ship 2`)
    }
    enemy.setPosition(start_x, start_y)
    set_offset(enemy)
}
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.boss, function (sprite, otherSprite) {
    boss_healthbar = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, otherSprite)
    boss_healthbar.value += -2
    powerup_bar.value += 5
    if (boss_healthbar.value < 1) {
        sprites.destroy(otherSprite, effects.fire, 500)
        info.changeScoreBy(2500)
    }
    sprites.destroy(sprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    otherSprite.setPosition(sprite.x, sprite.y)
    otherSprite.follow(sprite, 500)
    otherSprite.setImage(assets.image`shield`)
    otherSprite.scale = 2
    otherSprite.z = 10
})
info.onScore(5000, function () {
    boss_sprite = sprites.create(assets.image`boss`, SpriteKind.boss)
    boss_sprite.setPosition(randint(20, 140), -20)
    boss_sprite.z = -5
    sprites.setDataNumber(boss_sprite, "x_offset", randint(-50, 50))
    sprites.setDataNumber(boss_sprite, "y_offset", randint(-5, -25))
    boss_healthbar = statusbars.create(50, 4, StatusBarKind.Health)
    boss_healthbar.attachToSprite(boss_sprite, -5, 0)
    boss_healthbar.max = 100
    boss_healthbar.value = boss_healthbar.max
})
function boss_behaviour () {
    update_enemy_position(boss_sprite, formation_center)
    if (randint(0, 120) == 0) {
        sprites.setDataNumber(boss_sprite, "x_offset", randint(-50, 50))
        sprites.setDataNumber(boss_sprite, "y_offset", randint(-5, -25))
    }
    if (randint(0, 120) == 0) {
        enemy_fire(boss_sprite)
        lasers = sprites.allOfKind(SpriteKind.enemy_projectile)
        lasers[lasers.length - 1].scale = 5
    }
}
function set_offset (enemy: Sprite) {
    x_offset = randint(-4, 4) * 16
    y_offset = randint(-3, 1) * 16
    sprites.setDataNumber(enemy, "x_offset", x_offset)
    sprites.setDataNumber(enemy, "y_offset", y_offset)
}
sprites.onOverlap(SpriteKind.enemy_projectile, SpriteKind.Food, function (sprite, otherSprite) {
    if (otherSprite.overlapsWith(ship)) {
        sprites.destroy(otherSprite, effects.disintegrate, 500)
        sprites.destroy(sprite)
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    player_hit(sprite, otherSprite)
})
let start_y = 0
let start_x = 0
let lasers: Sprite[] = []
let boss_sprite: Sprite = null
let boss_healthbar: StatusBarSprite = null
let enemy: Sprite = null
let y_offset = 0
let x_offset = 0
let proj: Sprite = null
let projectile: Sprite = null
let shield: Sprite = null
let shield_count = 0
let launch_angle = 0
let powerup_bar: StatusBarSprite = null
let powerup_overheated = false
let formation_center: Sprite = null
let ship: Sprite = null
let enemy_shot_speed = 0
let player_shot_speed = 0
let player_speed = 0
let deceleration = 0
deceleration = 0.9
player_speed = 20
player_shot_speed = -100
enemy_shot_speed = 70
ship = sprites.create(assets.image`ship`, SpriteKind.Player)
ship.y = 108
ship.z = 5
ship.setStayInScreen(true)
formation_center = sprites.create(assets.image`empty`, SpriteKind.centre)
formation_center.setBounceOnWall(true)
formation_center.setVelocity(randint(-10, 10), randint(-10, 10))
info.setLife(3)
info.setScore(0)
effects.starField.startScreenEffect()
powerup_overheated = false
powerup_bar = statusbars.create(60, 2, StatusBarKind.Magic)
powerup_bar.setPosition(128, 118)
powerup_bar.max = 100
powerup_bar.value = 0
game.onUpdate(function () {
    player_movement()
    if (sprites.allOfKind(SpriteKind.Enemy).length > 0) {
        enemy_behaviour()
    }
    if (sprites.allOfKind(SpriteKind.boss).length > 0) {
        boss_behaviour()
    }
    constrain_formation_position()
})
game.onUpdateInterval(5000, function () {
    start_x = randint(0, 1) * 160
    start_y = randint(0, 90)
    for (let index = 0; index < randint(3, 6); index++) {
        spawn_enemy(start_x, start_y)
    }
})
