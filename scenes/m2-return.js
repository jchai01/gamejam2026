const ENEMY_TYPES = {
  ASTEROID: 0,
  TYPE1: 1,
  TYPE2: 2,
};

class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
  }

  launch(x, y) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

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
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
      this.setVelocity(0, 0);
    }
  }

  update() {
    // inverse
    if (!this.active) return;
    if (this.y < this.scene.scale.height + 50 || this.y < -100) {
      this.kill();
    }
  }
}

class AsteroidEnemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "asteroid");
    this.hp = 4;
    this.setScale(0.25);
  }
}

class Type1Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy1");
    this.hp = 5;
    this.setScale(0.25);
    this.fireRate = 1000;
    this.nextFire = 0;
    // velocity set before launch in spawnEnemy()

  }

  update(time) {
    if (this.active && time > this.nextFire && this.y > 300) {
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

class Type2Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy2");
    this.hp = 10;
    this.setScale(0.4);
    this.fireRate = 1200;
    this.nextFire = 0;
  }

  update(time) {
    if (this.active && time > this.nextFire && this.y > 600) {
      this.shoot();
      this.nextFire = time + this.fireRate;
    }
  }

  shoot() {
    this.scene.sound.play('enemyShoot', {
      volume: 0.2,
    })

    const bullet1 = this.scene.enemyBulletGroup.getFirstDead(
      true,
      this.x,
      this.y,
    );
    if (bullet1) {
      bullet1.setActive(true).setVisible(true);
      bullet1.body.enable = true;
      bullet1.body.reset(this.x - 15, this.y + 20);
      bullet1.setVelocityY(-600);

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
      bullet2.setVelocityY(-600);
    }
  }
}

const ENEMY_MAP = {
  [ENEMY_TYPES.ASTEROID]: AsteroidEnemy,
  [ENEMY_TYPES.TYPE1]: Type1Enemy,
  [ENEMY_TYPES.TYPE2]: Type2Enemy,
};

const DATA_KEYS = Object.freeze({
  ROTATION_SPEED: "ROTATION_SPEED", // for random asteroid rotation
});

export class M2ReturnScene extends Phaser.Scene {
  constructor() {
    super({ key: "M2ReturnScene" });
  }

  init() { }

  preload() {
    this.load.image("player", "assets/images/player.png");
    this.load.image("asteroid", "assets/images/asteroid.png");
    this.load.image("bullet", "assets/images/bullet.png");
    this.load.image("enemyBullet", "assets/images/enemyBullet.png");
    this.load.image("missile", "assets/images/missile.png");
    this.load.image("enemy1", "assets/images/enemy1.png");
    this.load.image("enemy2", "assets/images/enemy2.png");

    this.load.audio('missionTheme', 'assets/music/missionTheme.mp3');

    this.load.audio('playerShoot', 'assets/sfx/playerShoot.wav');
    this.load.audio('enemyShoot', 'assets/sfx/enemyShoot.wav');
    this.load.audio('enemyShoot2', 'assets/sfx/enemyShoot2.wav');
    this.load.audio('bulletHit', 'assets/sfx/bulletHit.wav');
    this.load.audio('bleep', 'assets/sfx/bleep.wav');
    this.load.audio('explosion', 'assets/sfx/explosion.wav');
    this.load.audio('explosion2', 'assets/sfx/explosion2.ogg');
    this.load.audio('afterburner', 'assets/sfx/afterburner.wav');


    if (this.cache.json.exists("levelData")) {
      this.cache.json.remove("levelData");
    }

    console.log(this.registry.get("stage"));
    if (this.registry.get("stage") === 2) {
      this.load.json("levelData", "assets/data/m2-return.json");
    } else {
      this.load.json("levelData", "assets/data/m3-return.json");
    }

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.sound.stopAll();
    this.music = this.sound.add('missionTheme');

    this.music.play({
      loop: true,
      volume: 0.5,
      delay: 0
    });

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4); // x, y, radius
    graphics.generateTexture("white_dot", 8, 8);

    this.player = this.physics.add.image(this.scale.width / 2, 600, "player");
    this.player.flipY = true;
    this.player.setScale(this.registry.get("shipWidth"));
    this.player.setDepth(3);
    this.player.shield = 5;
    this.player.isInvincible = false;
    this.player.alive = true;
    this.player.setCollideWorldBounds(true);

    // mission 2 return
    if (this.registry.get("stage") === 2) {
      this.sound.play('afterburner', {
        volume: 0.2,
      })

      this.missile = this.physics.add.sprite(this.scale.width / 2, -600, 'missile');
      this.missile.setScale(2.5);
      this.missile.disabled = false;
      this.missileTimer = this.time.addEvent({
        delay: 25000,
        callback: this.disableMissile,
        callbackScope: this,
      });

      this.missileEmitter = this.add.particles(0, 0, 'white_dot', {
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD',
        color: [0xffff00, 0xff8800, 0xff0000],
        lifespan: 500,
        follow: this.missile
      });

    }

    this.pools = {};

    this.shieldText = this.add.text(20, 920, `Shield: ${this.player.shield}`, {
      fontSize: "24px",
    });

    this.asteroidGroup = this.physics.add.group({
      defaultKey: "asteroid",
      maxSize: 20,
    });

    this.bulletGroup = this.physics.add.group([]);
    this.lastBulletFiredTime = 0;

    this.enemyBulletGroup = this.physics.add.group({
      defaultKey: "enemyBullet",
      maxSize: 50,
    });

    this.physics.add.overlap(
      this.player,
      this.enemyBulletGroup,
      this.handlePlayerHit,
      null,
      this,
    );

    this.physics.add.overlap(
      this.bulletGroup,
      this.asteroidGroup,
      this.handleBulletAndEnemyCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.asteroidGroup,
      this.handlePlayerAndEnemyCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.missile,
      this.handlePlayerAndMissileCollision,
      null,
      this,
    );
    this.eventsList = this.cache.json.get("levelData").events;
    this.eventIndex = 0;

    this.pools = {};

    Object.keys(ENEMY_MAP).forEach((typeID) => {
      const EnemyClass = ENEMY_MAP[typeID];

      this.pools[typeID] = this.physics.add.group({
        classType: EnemyClass,
        maxSize: 20,
        runChildUpdate: true,
      });
    });

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

    this.convoText = this.add
      .text(10, 750, "", {
        font: "20px Orbitron",
        fill: "#ffffff",
        align: "left",
      })
      .setOrigin(0, 0)
      .setDepth(10);
    this.processNextEvent();

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
      color: [0xffff00, 0xff8800, 0xff0000], // particles change color over their life
      colorEase: "quad.out",
      emitting: false,
      blendMode: "ADD",
    });
    this.bulletEmitter.setDepth(5);

    this.starEmitter = this.add.particles(0, 0, "white_dot", {
      x: { min: 0, max: 540 },
      y: { min: 960, max: 960 },
      lifespan: 10000,
      speedY: { min: -100, max: -200 },
      scale: { min: 0.5, max: 1 },
      alpha: { min: 0.5, max: 0.9 },
      frequency: 150, // How often to spawn a new star (lower = more stars)
      blendMode: "ADD",
    });
    this.starEmitter.setDepth(1);

    for (let i = 0; i < 100; i++) {
      this.starEmitter.fastForward(100);
    }


  }

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

    if (this.missile) {
      if (!this.missile.disabled) {
        let angle = Phaser.Math.Angle.Between(
          this.missile.x, this.missile.y,
          this.player.x, this.player.y
        );
        this.missile.rotation = angle + Math.PI / 2;
        this.physics.moveToObject(this.missile, this.player, 180);
      }
    }

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

    this.asteroidGroup.getChildren().forEach((asteroid) => {
      if (
        asteroid.active &&
        (asteroid.x < 0 ||
          asteroid.x > this.scale.width ||
          asteroid.y < 0 ||
          asteroid.y > this.scale.height + 100)
      ) {
        asteroid.setActive(false).setVisible(false);
      }
      asteroid.rotation += asteroid.getData(DATA_KEYS.ROTATION_SPEED);
    });
  }

  fireBullet() {
    this.sound.play('playerShoot', {
      volume: 0.2,
    })

    const x = this.player.x;
    const y = this.player.y;
    // create game object if not found,x,y, texture, frame number, visibility
    const bullet = this.bulletGroup.getFirstDead(true, x, y, "bullet");
    bullet.setActive(true).setVisible(true).setScale(1).enableBody();
    bullet.setVelocityY(1000);
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

  handlePlayerAndMissileCollision(player, missile) {
    this.sound.play('explosion2', {
      volume: 0.7,
    })

    this.missileEmitter.destroy()
    this.explosionEmitter.explode(30, player.x, player.y);
    this.explosionEmitter.explode(30, missile.x, missile.y);

    missile.disableBody();
    missile.setActive(false).setVisible(false);
    player.disableBody();
    player.setActive(false).setVisible(false);
    this.gameOver();
  }

  handlePlayerAndEnemyCollision(player, enemy) {
    enemy.die();

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

  playDialogue(line, onComplete) {
    this.sound.play('bleep', {
      volume: 0.5,
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

  spawnEnemy(typeId, x) {
    const pool = this.pools[typeId];
    const enemy = pool.getFirstDead(true);

    if (enemy) {
      enemy.setActive(true).setVisible(true);
      enemy.launch(x, 980);
      enemy.flipY = true;

      // fixed velocity for now
      enemy.setVelocityY(-200);
    }
  }

  processNextEvent() {
    if (this.eventIndex >= this.eventsList.length) {
      let currMission = this.registry.get("stage");
      this.registry.set("stage", currMission + 1);
      this.sound.stopAll();
      this.scene.start("MenuScene");
    }

    this.convoText.setText("");

    let currentEvent = this.eventsList[this.eventIndex];
    if (!currentEvent) return;

    if (currentEvent.type === 0) {
      if (currentEvent.text) {
        this.playDialogue(currentEvent.text, () => {
          this.time.delayedCall(currentEvent.delay, () => {
            this.eventIndex++;
            this.processNextEvent();
          });
        });
      } else {
        this.time.delayedCall(currentEvent.delay, () => {
          this.eventIndex++;
          this.processNextEvent();
        });

      }
    } else if (currentEvent.type === 1) {
      this.spawnEnemy(currentEvent.enemyType, currentEvent.x);
      this.time.delayedCall(currentEvent.delay, () => {
        this.eventIndex++;
        this.processNextEvent();
      });
    }
  }

  disableMissile() {
    this.missile.body.checkCollision.none = true;
    this.missile.disabled = true;
    this.missile.body.setDrag(200);
    this.missileEmitter.destroy()

    this.time.delayedCall(1200, () => {
      this.sound.play('explosion2', {
        volume: 0.5,
      })

      this.explosionEmitter.explode(30, this.missile.x, this.missile.y);
      this.missile.setActive(false).setVisible(false);
      this.missile.disableBody();
    });
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
}
