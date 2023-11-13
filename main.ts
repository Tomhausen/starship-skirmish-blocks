namespace SpriteKind {
    export const enemy_projectile = SpriteKind.create()
    export const centre = SpriteKind.create()
}
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (projectile, enemy) {
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
function enemy_fire (enemy: Sprite) {
    proj = sprites.createProjectileFromSprite(assets.image`enemy projectile`, enemy, 0, enemy_shot_speed)
    proj.setKind(SpriteKind.enemy_projectile)
    music.pewPew.play()
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
function set_offset (enemy: Sprite) {
    x_offset = randint(-4, 4) * 16
    y_offset = randint(-3, 1) * 16
    sprites.setDataNumber(enemy, "x_offset", x_offset)
    sprites.setDataNumber(enemy, "y_offset", y_offset)
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    player_hit(sprite, otherSprite)
})
let start_y = 0
let start_x = 0
let enemy: Sprite = null
let y_offset = 0
let x_offset = 0
let proj: Sprite = null
let projectile: Sprite = null
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
formation_center = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.centre)
formation_center.setBounceOnWall(true)
formation_center.setVelocity(randint(-10, 10), randint(-10, 10))
info.setLife(3)
info.setScore(0)
effects.starField.startScreenEffect()
game.onUpdate(function () {
    player_movement()
    if (sprites.allOfKind(SpriteKind.Enemy).length > 0) {
        enemy_behaviour()
    }
    constrain_formation_position()
})
game.onUpdateInterval(7500, function () {
    start_x = randint(0, 1) * 160
    start_y = randint(0, 90)
    for (let index = 0; index < randint(3, 6); index++) {
        spawn_enemy(start_x, start_y)
    }
})
