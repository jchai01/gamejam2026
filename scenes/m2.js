const ENEMY_TYPES = {
  ASTEROID: 0,
  TYPE1: 1,
  TYPE2: 2,
  BOSS: 3,
  PACEMAKER: 4,
  DIAMOND: 5,
};

class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
  }

  launch(x, y) {
    this.setPosition(x, y);
    this.setActive(true).setVisible(true);

    if (this.body) {
      this.body.enable = true;
    }
  }

  die() {
    this.scene.sound.play('explosion2', {
      volume: 0.3,
    })
    this.scene.explosionEmitter.explode(30, this.x, this.y);
    this.kill();
  }

  kill() {
    this.setActive(false).setVisible(false);
    if (this.body) {
      this.body.enable = false;
      this.setVelocity(0, 0);
    }
  }

  update() {
    if (!this.active) return;
    if (this.y > this.scene.scale.height + 50 || this.y < -50) {
      this.kill();
    }
  }
}

class AsteroidEnemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "asteroid");
    this.hp = 4;
  }
}

// aiming enemy
class Type1Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy1");
    this.hp = 5;
    this.setScale(0.25);
    this.fireRate = 1000;
    this.nextFire = 0;

    if (this.body) {
      this.setVelocityY(200);
    }
  }

  launch(x, y) {
    super.launch(x, y)
    // this.setActive(true).setVisible(true);
    this.setVelocityY(200)
  }

  update(time) {
    if (this.active && time > this.nextFire && this.y < 600) {
      this.shoot();
      this.nextFire = time + this.fireRate;
    }
  }

  shoot() {
    this.scene.sound.play('enemyShoot', {
      volume: 0.2,
    })
    const bullet = this.scene.enemyBulletGroup.getFirstDead(
      true,
      this.x,
      this.y,
    );

    if (bullet) {
      bullet.body.enable = true;
      bullet.body.reset(this.x, this.y + 20);
      bullet.setActive(true).setVisible(true);
    }

    this.scene.physics.moveToObject(bullet, this.scene.player, 600);
  }



}

// red enemy
class Type2Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy2");
    this.hp = 5;
    this.setScale(0.4);
    this.fireRate = 1200;
    this.nextFire = 0;
  }

  launch(x, y) {
    super.launch(x, y)
    // this.setActive(true).setVisible(true);
    this.setVelocityY(200)
  }

  update(time) {
    if (this.active && time > this.nextFire && this.y < 600) {
      this.shoot();
      this.nextFire = time + this.fireRate;
    }
  }

  shoot() {
    const bullet1 = this.scene.enemyBulletGroup.getFirstDead(
      true,
      this.x,
      this.y,
    );
    if (bullet1) {
      this.scene.sound.play('enemyShoot', {
        volume: 0.3,
      })

      bullet1.setActive(true).setVisible(true);
      bullet1.body.enable = true;
      bullet1.body.reset(this.x - 15, this.y + 20);
      bullet1.setVelocityY(600);

    }

    const bullet2 = this.scene.enemyBulletGroup.getFirstDead(
      true,
      this.x,
      this.y,
    );
    if (bullet2) {
      bullet2.setActive(true).setVisible(true);
      bullet2.body.enable = true;
      bullet2.body.reset(this.x + 15, this.y + 20);
      bullet2.setVelocityY(600);

    }
  }
}

class BossEnemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "boss");
    this.hp = 60;
    this.boss = true;

    this.isEntering = true;

    // The center point of your circle
    this.centerX = 270;
    this.centerY = 250;

    // Smoothly move from spawn point to the center of the circle
    scene.tweens.add({
      targets: this,
      x: this.centerX,
      y: this.centerY,
      duration: 2000,
      ease: 'Back.easeOut', // Gives a nice little "settle" effect
      onComplete: () => {
        this.timeOffset = this.scene.time.now;
        this.isEntering = false; // Now start the circle math!
      }
    });

    this.pattern1FireRate = 1200;
    this.pattern1NextFire = 0;

    this.pattern2FireRate = 600;
    this.pattern2NextFire = 0;
  }

  update(time) {
    if (!this.scene.debugFreeze) {
      // boss circle movement
      // e.g. anchor + Math.cos(time / speed) * radius
      this.x = 270 + Math.cos(time / 500) * 80;
      this.y = 250 + Math.sin(time / 500) * 50;
    }

    if (this.active && time > this.pattern1NextFire) {
      this.shootPattern1();
      this.pattern1NextFire = time + this.pattern1FireRate;
    }

    if (this.active && time > this.pattern2NextFire) {
      this.shootPattern2();
      this.pattern2NextFire = time + this.pattern2FireRate;
    }

  }

  shootPattern1() {
    const offset1_X = 40;
    const offset1_Y = -42;

    const offset2_X = -37;
    const offset2_Y = -40;

    const bulletSpeed = 400;

    this.scene.sound.play('enemyShoot', {
      volume: 0.2,
    })

    for (let i = 0; i < 12; i++) {
      const angle = i * 30; // 0, 45, 90, 135, etc.
      const bullet = this.scene.enemyBulletGroup.get(this.x + offset1_X, this.y + offset1_Y);
      if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.body.enable = true
        this.scene.physics.velocityFromAngle(angle, bulletSpeed, bullet.body.velocity);
        bullet.setAngle(angle);
      }
    }

    for (let i = 0; i < 10; i++) {
      const angle = i * 30; // 0, 45, 90, 135, etc.
      const bullet = this.scene.enemyBulletGroup.get(this.x + offset2_X, this.y + offset2_Y);
      if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.body.enable = true
        this.scene.physics.velocityFromAngle(angle, bulletSpeed, bullet.body.velocity);
        bullet.setAngle(angle);
      }
    }
  }

  shootPattern2() {
    this.scene.sound.play('enemyShoot2', {
      volume: 0.2,
    })
    const offset1_X = -105;
    const offset1_Y = 18;

    const offset2_X = 103;
    const offset2_Y = 18;


    const bullet1 = this.scene.enemyBulletGroup.getFirstDead(
      true,
      this.x + offset1_X,
      this.y + offset1_Y,
    );
    if (bullet1) {
      bullet1.body.enable = true;
      bullet1.setActive(true).setVisible(true);

      this.scene.physics.moveToObject(bullet1, this.scene.player, 600);
    }

    const bullet2 = this.scene.enemyBulletGroup.getFirstDead(
      true,
      this.x + offset2_X,
      this.y + offset2_Y,
    );
    if (bullet2) {
      bullet2.body.enable = true;
      bullet2.setActive(true).setVisible(true);

      this.scene.physics.moveToObject(bullet2, this.scene.player, 600);
    }
  }

  die() {
    this.scene.sound.play('explosion2', {
      volume: 0.7,
    })

    for (let i = 0; i < 10; i++) {
      const offsetX = Phaser.Math.Between(-this.width / 2, this.width / 2);
      const offsetY = Phaser.Math.Between(-this.height / 2, this.height / 2);
      this.scene.explosionEmitter.explode(30, this.x + offsetX, this.y + offsetY);
    }
    this.destroy();
    this.kill();
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
      this.setVelocity(0, 0);
    }
  }
}

class DiamondEnemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "diamond");

    this.hp = 8;
    this.setScale(0.65);
    this.fireRate = Phaser.Math.Between(600, 1000);;
    this.nextFire = 0;

    this.orbitAngle = 0;
    this.orbitDistance = 150; // Radius of the circle
    this.orbitSpeed = 0.002;  // Speed of rotation

    this.boss = true; // can't just collide to destroy it
  }

  update(time, delta) {
    if (!this.active || !this.pacemaker || !this.pacemaker.active) {
      // destroy all diamonds if pacemaker is dead
      this.die();
    };

    if (this.active && time > this.nextFire && this.scene.introductionDone) {
      this.body.enable = true;
      this.shoot();
      this.nextFire = time + this.fireRate;
    }

    this.orbitAngle = this.orbitAngle || 0;
    this.orbitAngle += (this.orbitSpeed || 0.002) * delta;

    const newX = this.pacemaker.x + Math.cos(this.orbitAngle) * this.orbitDistance;
    const newY = this.pacemaker.y + Math.sin(this.orbitAngle) * this.orbitDistance;

    this.setPosition(newX, newY);

    if (this.body) {
      this.body.reset(newX, newY);
    }
  }

  shoot() {
    const offset1_X = 40;
    const offset1_Y = -42;

    const bulletSpeed = 400;

    for (let i = 0; i < 8; i++) {
      const angle = i * 45; // 0, 45, 90, 135, etc.
      const bullet = this.scene.enemyBulletGroup.get(this.x + offset1_X, this.y + offset1_Y);
      if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.body.enable = true
        this.scene.physics.velocityFromAngle(angle, bulletSpeed, bullet.body.velocity);
        bullet.setAngle(angle);
      }
    }
  }
}

class PacemakerEnemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "pacemaker");
    scene.physics.add.existing(this);

    this.hp = 60;
    this.setScale(0.5);
    this.boss = true;
  }

  update() {
    if (this.scene.introductionDone) {
      this.body.checkCollision.none = false;
    }
  }

  die() {
    this.scene.sound.play('explosion2', {
      volume: 0.7,
    })

    for (let i = 0; i < 10; i++) {
      const offsetX = Phaser.Math.Between(-this.width / 2, this.width / 2);
      const offsetY = Phaser.Math.Between(-this.height / 2, this.height / 2);
      this.scene.explosionEmitter.explode(30, this.x + offsetX, this.y + offsetY);
    }
    this.kill();
    this.destroy();
  }
}

const ENEMY_MAP = {
  [ENEMY_TYPES.ASTEROID]: AsteroidEnemy,
  [ENEMY_TYPES.TYPE1]: Type1Enemy,
  [ENEMY_TYPES.TYPE2]: Type2Enemy,
  [ENEMY_TYPES.BOSS]: BossEnemy,
  [ENEMY_TYPES.PACEMAKER]: PacemakerEnemy,
  [ENEMY_TYPES.DIAMOND]: DiamondEnemy,
};

export class M2Scene extends Phaser.Scene {
  constructor() {
    super({ key: "M2Scene" });
  }

  init() { }

  preload() {
    this.load.image("player", "assets/images/player.png");
    this.load.image("asteroid", "assets/images/asteroid.png");
    this.load.image("bullet", "assets/images/bullet.png");
    this.load.image("enemyBullet", "assets/images/enemyBullet.png");
    this.load.image("enemy1", "assets/images/enemy1.png");
    this.load.image("enemy2", "assets/images/enemy2.png");
    this.load.image("boss", "assets/images/boss.png");
    this.load.image("earthBg", "assets/images/earthBg.png");
    this.load.image("pacemaker", "assets/images/pacemakerTopview.png");
    this.load.image("diamond", "assets/images/diamond.png");

    // music
    this.load.audio('missionTheme', 'assets/music/missionTheme.mp3');
    this.load.audio('bossTheme', 'assets/music/bossTheme.mp3');

    // sfx
    this.load.audio('missionTheme', 'assets/music/missionTheme.mp3');
    this.load.audio('playerShoot', 'assets/sfx/playerShoot.wav');
    this.load.audio('enemyShoot', 'assets/sfx/enemyShoot.wav');
    this.load.audio('enemyShoot2', 'assets/sfx/enemyShoot2.wav');
    this.load.audio('bulletHit', 'assets/sfx/bulletHit.wav');
    this.load.audio('bleep', 'assets/sfx/bleep.wav');
    this.load.audio('explosion', 'assets/sfx/explosion.wav');
    this.load.audio('explosion2', 'assets/sfx/explosion2.ogg');
    this.load.audio('afterburner', 'assets/sfx/afterburner.wav');

    // remove the old level data
    if (this.cache.json.exists("levelData")) {
      this.cache.json.remove("levelData");
    }
    if (this.registry.get("stage") === 2) {
      this.load.json("levelData", "assets/data/m2.json");
    } else if (this.registry.get("stage") === 3) {
      this.load.json("levelData", "assets/data/m3.json");
    }
    else {
      this.load.json("levelData", "assets/data/m4.json");
    }

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.sound.stopAll();
    if (this.registry.get("stage") === 4) {
      this.music = this.sound.add('bossTheme');

    } else {
      this.music = this.sound.add('missionTheme');
    }

    this.music.play({
      loop: true,
      volume: 0.5,
      delay: 0
    });

    switch (this.registry.get("stage")) {
      case 1:
        this.skipToAction = 0;
        break;
      case 2:
        this.skipToAction = 4;
        break;
      case 3:
        this.skipToAction = 2;
        break;
      case 4:
        this.skipToAction = 4;
        break;
      default:
        this.skipToAction = 0;
        break;
    }

    this.player = this.physics.add.image(0, 0, "player");
    this.player.setPosition(this.scale.width / 2, 900);
    this.player.setScale(this.registry.get("shipWidth"));
    this.player.setDepth(3);
    this.player.shield = 5;
    this.player.alive = true;
    this.player.setCollideWorldBounds(true);

    this.introductionDone = false;

    this.debugFreeze = false;

    this.input.keyboard.on('keydown-P', () => {
      // this.debugFreeze = !this.debugFreeze;
      // console.log(this.debugFreeze ? "Boss Frozen" : "Boss Moving");
    });

    this.input.keyboard.on("keydown-X", () => {
      if (this.eventIndex < this.skipToAction) {
        console.log("skip activated");
        // if (this.delayTimer) {
        //   this.delayTimer = null;
        //   this.delayTimer.remove();
        // }
        this.eventIndex = this.skipToAction;
        // this.processNextEvent();
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (this.boss) {
        const offsetX = Math.round(pointer.x - this.boss.x);
        const offsetY = Math.round(pointer.y - this.boss.y);
        console.log(`X Offset: ${offsetX}, Y Offset: ${offsetY}`);
      }
    });

    this.shieldText = this.add.text(20, 20, `Shield: ${this.player.shield}`, {
      fontSize: "24px",
    });

    // set player hitbox
    this.player.body.setSize(1000, 1800);
    // this.player.body.setOffset(0, 0);

    this.bulletGroup = this.physics.add.group([]);
    this.lastBulletFiredTime = 0;

    this.enemyBulletGroup = this.physics.add.group({
      defaultKey: "enemyBullet",
      maxSize: 100,
    });
    this.physics.add.overlap(
      this.player,
      this.enemyBulletGroup,
      this.handlePlayerHit,
      null,
      this,
    );

    this.eventsList = this.cache.json.get("levelData").events;
    this.eventIndex = 0;

    this.pools = {};

    // Loop through the map and create a Group for each enemy type
    Object.keys(ENEMY_MAP).forEach((enemyTypeID) => {
      const EnemyClass = ENEMY_MAP[enemyTypeID];

      this.pools[enemyTypeID] = this.physics.add.group({
        classType: EnemyClass,
        maxSize: 50,
        runChildUpdate: true,
      });
    });

    // set up collisions for every pool created
    const allEnemyPools = Object.values(this.pools);
    allEnemyPools.forEach((enemyPool) => {
      if (enemyPool) {
        this.physics.add.overlap(
          this.bulletGroup,
          enemyPool,
          this.handleBulletAndEnemyCollision,
          null,
          this,
        );

        this.physics.add.overlap(
          this.player,
          enemyPool,
          this.handlePlayerAndEnemyCollision,
          null,
          this,
        );
      }
    });

    if (this.registry.get("stage") === 4) {
      this.convoText = this.add
        .text(10, 200, "", {
          font: "bold 20px Orbitron",
          fill: "#ffffff",
          align: "left",
        })
        .setOrigin(0, 0)
        .setDepth(10)
        .setShadow(5, 5, 'rgba(0,0,0,0.8)', 8);

    } else {
      this.convoText = this.add
        .text(10, 200, "", {
          font: "bold 20px Orbitron",
          fill: "#ffffff",
          align: "left",
        })
        .setOrigin(0, 0)
        .setDepth(10)
        .setShadow(5, 5, 'rgba(0,0,0,0.8)', 8);
    }


    this.processNextEvent();

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture("white_dot", 8, 8);

    this.bulletEmitter = this.add.particles(0, 0, "white_dot", {
      lifespan: 300,
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      emitting: false,
      blendMode: "ADD",
      tint: [0x00ff00, 0x44ff44, 0xffffff],
    });
    this.bulletEmitter.setDepth(5);

    this.explosionEmitter = this.add.particles(0, 0, "white_dot", {
      lifespan: 400,
      speed: { min: 100, max: 600 },
      scale: { start: 3, end: 0.2 },
      color: [0xffff00, 0xff8800, 0xff0000],
      colorEase: "quad.out",
      emitting: false,
      blendMode: "ADD",
    });
    this.bulletEmitter.setDepth(5);

    if (this.registry.get("stage") !== 4) {
      this.starEmitter = this.add.particles(0, 0, "white_dot", {
        x: { min: 0, max: 540 },
        y: { min: 0, max: 0 },
        lifespan: 5000,
        speedY: { min: 100, max: 200 },
        scale: { min: 0.2, max: 0.7 },
        alpha: { start: 0.8, end: 0.3 },
        frequency: 150,
        blendMode: "ADD",
      });
      this.starEmitter.setDepth(1);

      for (let i = 0; i < 100; i++) {
        this.starEmitter.fastForward(100);
      }
    } else {
      // final stage
      this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'earthBg');
      this.background.setDepth(-1);

      const pacemakerPool = this.pools[ENEMY_TYPES.PACEMAKER];
      this.pacemaker = pacemakerPool.getFirstDead(true, this.scale.width / 2, 250);

      // this.pacemaker.body.setSize(this.width / 2, this.height / 2, true);
      this.pacemaker.body.setSize(300, 300, true);

      this.pacemaker.body.checkCollision.none = true;

      this.pacemaker.once('destroy', () => {
        this.eventIndex++;
        this.processNextEvent();
      });
    }
  } // end create

  update(time) {
    const moveAmount = 600;

    this.player.setVelocity(0);

    let velocity = new Phaser.Math.Vector2(0, 0);

    if (this.cursorKeys.left.isDown) {
      velocity.x = -1;
    } else if (this.cursorKeys.right.isDown) {
      velocity.x = 1;
    }
    if (this.cursorKeys.up.isDown) {
      velocity.y = -1;
    } else if (this.cursorKeys.down.isDown) {
      velocity.y = 1;
    }
    velocity.normalize();
    this.player.setVelocity(velocity.x * moveAmount, velocity.y * moveAmount);

    if (this.cursorKeys.space.isDown && time > this.lastBulletFiredTime + 100) {
      if (this.player.alive) {
        this.fireBullet();
        this.lastBulletFiredTime = time;
      }
    }

    this.bulletGroup.getChildren().forEach((bullet) => {
      if (
        bullet.active &&
        (bullet.x < 0 ||
          bullet.x > this.scale.width ||
          bullet.y < 0 ||
          bullet.y > this.scale.height)
      ) {
        bullet.setActive(false).setVisible(false);

      }
    });

    this.enemyBulletGroup.getChildren().forEach((bullet) => {
      if (bullet.active) {
        if (bullet.y > this.scale.height ||
          bullet.y < 0 ||
          bullet.x > this.scale.width ||
          bullet.x < 0) {

          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.stop();
        }
      }
    });
  }

  fireBullet() {
    this.sound.play('playerShoot', {
      volume: 0.2,
    })

    const x = this.player.x;
    const y = this.player.y;

    const bullet = this.bulletGroup.getFirstDead(true, x, y, "bullet", 0, true);
    bullet.setActive(true).setVisible(true).setScale(1).enableBody();
    bullet.setVelocityY(-1000);
  }

  spawnEnemy(typeID, x) {
    const pool = this.pools[typeID];
    const enemy = pool.getFirstDead(true, x, -50);
    // enemy.setActive(true).setVisible(true);

    enemy.launch(x, -50);

    if (typeID === 3) {
      this.boss = enemy;
      enemy.setScale(0.8);

      enemy.once('destroy', () => {
        this.eventIndex++;
        this.processNextEvent();
      });
    }
  }

  handleBulletAndEnemyCollision(bullet, enemy) {
    this.sound.play('bulletHit', {
      volume: 0.2,
    })

    this.bulletEmitter.explode(10, bullet.x, bullet.y);

    bullet.disableBody();
    bullet.setActive(false).setVisible(false);

    enemy.hp -= 1;
    if (enemy.hp <= 0) {
      enemy.die();
    } else {
      enemy.setTint(0xff5555);
      this.tweens.add({
        targets: enemy,
        alpha: 1,
        duration: 100,
        onComplete: () => {
          enemy.clearTint();
        },
      });
    }
  }

  handlePlayerAndEnemyCollision(player, enemy) {
    this.sound.play('explosion2', {
      volume: 0.5,
    })

    if (enemy.boss) {
      this.gameOver();
    }
    else {
      this.explosionEmitter.explode(30, enemy.x, enemy.y);
      enemy.disableBody();
      enemy.setActive(false).setVisible(false);
    }

    if (this.player.shield <= 0) {
      this.gameOver();
    } else {
      if (!player.isInvincible) {
        this.player.shield -= 1;
        this.shieldText.setText(`Shield: ${this.player.shield}`);
        player.isInvincible = true;
        player.setTint(0xff2222);

        this.tweens.add({
          targets: player,
          alpha: 0.4,
          duration: 100,
          ease: "Linear",
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            player.isInvincible = false;
            player.clearTint();
            player.alpha = 1;
          },
        });
      }
    }
  }

  handlePlayerHit(player, enemyBullet) {
    this.bulletEmitter.explode(10, enemyBullet.x, enemyBullet.y);
    enemyBullet.setActive(false).setVisible(false).disableBody();

    if (this.player.shield <= 0) {
      this.gameOver();
    } else {
      if (!player.isInvincible) {
        this.player.shield -= 1;
        this.shieldText.setText(`Shield: ${this.player.shield}`);
        player.isInvincible = true;
        player.setTint(0xff2222);

        this.tweens.add({
          targets: player,
          alpha: 0.4,
          duration: 100,
          ease: "Linear",
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            player.isInvincible = false;
            player.clearTint();
            player.alpha = 1;
          },
        });
      }
    }
  }

  gameOver() {
    this.explosionEmitter.explode(30, this.player.x, this.player.y);
    this.player.disableBody();
    this.player.setActive(false).setVisible(false);
    this.player.alive = false;

    this.add
      .text(this.scale.width / 2, 400, "Game Over", {
        font: "bold 38px Orbitron",
        fill: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.sound.stopAll();
        this.scene.start("MenuScene")
      },
    });
  }

  playDialogue(line, onComplete) {
    this.sound.play('bleep', {
      volume: 0.2,
    })

    let charIndex = 0;
    this.convoText.setText("");

    this.time.addEvent({
      delay: 30,
      repeat: line.length - 1,
      callback: () => {
        if (line[charIndex]) {
          this.convoText.text += line[charIndex];
        }
        charIndex++;

        if (charIndex >= line.length) {
          onComplete();
        }
      },
      callbackScope: this,
    });
  }

  processNextEvent() {
    console.warn("DEBUGPRINT[53]: m2.js:938: this.eventIndex=", this.eventIndex)
    if (this.eventIndex >= this.eventsList.length) {
      this.time.removeAllEvents();
      this.scene.start("CheckpointScene");
    }

    this.convoText.setText("");

    let currentEvent = this.eventsList[this.eventIndex];
    if (!currentEvent) return;

    if (currentEvent.action) {
      if (currentEvent.action === 2) {
        // summon diamonds
        const diamondPool = this.pools[ENEMY_TYPES.DIAMOND];

        for (let i = 0; i < 6; i++) {
          let diamond = diamondPool.getFirstDead(true, 100, 100);
          if (diamond) {
            diamond.pacemaker = this.pacemaker;
            diamond.orbitAngle = (i / 6) * Math.PI * 2;
            diamond.body.enable = false;
          }
        }
      }
      if (currentEvent.action === 3) {
        // enable hitbox, and start shooting
        this.introductionDone = true;
      }
    }

    if (currentEvent.type === 0) {
      if (currentEvent.text) {
        this.playDialogue(currentEvent.text, () => {
          this.delayTimer = this.time.delayedCall(currentEvent.delay, () => {
            this.eventIndex++;
            this.processNextEvent();
          });
        });
      } else {
        this.time.delayedCall(currentEvent.delay, () => {
          this.delayTimer = this.eventIndex++;
          this.processNextEvent();
        });

      }
    }
    else if (currentEvent.type === 1) {
      console.warn("SUMMON", currentEvent.type)
      this.spawnEnemy(currentEvent.enemyType, currentEvent.x);
      if (currentEvent.enemyType !== 3) {
        this.delayTimer = this.time.delayedCall(currentEvent.delay, () => {
          this.eventIndex++;
          this.processNextEvent();
        });
      }
    }
    else if (currentEvent.type === 2) { }
    else if (currentEvent.type === 3) {
      // change music
      this.sound.stopAll();
      this.music = this.sound.add('bossTheme');

      this.music.play({
        loop: true,
        volume: 0.5,
        delay: 0
      });

      this.delayTimer = this.time.delayedCall(currentEvent.delay, () => {
        this.eventIndex++;
        this.processNextEvent();
      });


    }
  }
}
