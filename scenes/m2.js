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
    if (!this.active) return;
    if (this.y > this.scene.scale.height + 50 || this.y < -100) {
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

class Type1Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy1");
    this.hp = 5;
    this.setScale(0.2);
  }
  10;
  startPattern() {
    this.setVelocityY(200);
  }
}

class Type2Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy2");
    this.hp = 10;
    this.setScale(0.2);
  }

  startPattern() {
    this.setVelocityY(200);
  }
}

// const DATA_KEYS = Object.freeze({
//   ROTATION_SPEED: "ROTATION_SPEED",
// });

const ENEMY_MAP = {
  [ENEMY_TYPES.ASTEROID]: AsteroidEnemy,
  [ENEMY_TYPES.TYPE1]: Type1Enemy,
  [ENEMY_TYPES.TYPE2]: Type2Enemy,
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
    this.load.image("enemy1", "assets/images/enemy1.png");
    this.load.image("enemy2", "assets/images/enemy2.png");

    // remove the old level data
    if (this.cache.json.exists("levelData")) {
      this.cache.json.remove("levelData");
    }
    console.warn(
      "DEBUGPRINT[298]: m2.js:103: stage=",
      this.registry.get("stage"),
    );
    if (this.registry.get("stage") === 2) {
      this.load.json("levelData", "assets/data/m2.json");
    } else {
      this.load.json("levelData", "assets/data/m3.json");
    }

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create() {
    const gameW = this.scale.width;

    this.player = this.physics.add.image(0, 0, "player");
    this.player.setPosition(gameW / 2, 900);
    this.player.setScale(this.registry.get("shipWidth"));
    this.player.setDepth(3);

    this.player.health = 3;
    this.player.setCollideWorldBounds(true);

    this.bulletGroup = this.physics.add.group([]);
    this.lastBulletFiredTime = 0;

    this.eventsList = this.cache.json.get("levelData").events;
    console.warn(
      "DEBUGPRINT[297]: m2.js:126: this.eventsList=",
      this.eventsList,
    );
    this.eventIndex = 0;

    this.pools = {};

    // Loop through the map and create a Group for each enemy type
    Object.keys(ENEMY_MAP).forEach((typeID) => {
      const EnemyClass = ENEMY_MAP[typeID];

      this.pools[typeID] = this.physics.add.group({
        classType: EnemyClass,
        maxSize: 20,
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

    this.convoText = this.add
      .text(10, 200, "", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left",
      })
      .setOrigin(0, 0)
      .setDepth(10);

    this.processNextEvent();

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4); // x, y, radius
    graphics.generateTexture("white_dot", 8, 8);

    this.bulletEmitter = this.add.particles(0, 0, "white_dot", {
      lifespan: 300,
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      emitting: false, // Don't start automatically
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
      if (this.player.health > 0) {
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
  }

  fireBullet() {
    const x = this.player.x;
    const y = this.player.y;

    const bullet = this.bulletGroup.getFirstDead(true, x, y, "bullet", 0, true);
    bullet.setActive(true).setVisible(true).setScale(1).enableBody();
    bullet.setVelocityY(-1000);
  }

  spawnEnemy(typeID, x) {
    const pool = this.pools[typeID];
    const enemy = pool.getFirstDead(true, x, -50);

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.launch(x, -50);

      if (enemy.body) {
        enemy.body.reset(x, -50);
      }
      // fixed velocity for now
      enemy.setVelocity(0, 200);
    }
  }

  handleBulletAndEnemyCollision(bullet, enemy) {
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
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);

    if (this.player.health <= 0) {
      // game over
      this.explosionEmitter.explode(30, player.x, player.y);
      player.disableBody();
      player.setActive(false).setVisible(false);

      this.add
        .text(this.gameW / 2, 400, "Game Over", {
          font: "38px Arial",
          fill: "#ffffff",
          align: "left",
        })
        .setOrigin(0.5, 0.5)
        .setDepth(10);

      this.time.addEvent({
        delay: 3000,
        callback: () => this.scene.start("MenuScene"),
      });
    } else {
      if (!player.isInvincible) {
        this.player.health -= 1;
        console.log("HEALTH LEFT:" + this.player.health);
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
    console.warn(
      "DEBUGPRINT[299]: m2.js:383: this.eventIndex=",
      this.eventIndex,
    );

    if (this.eventIndex >= this.eventsList.length) {
      this.time.removeAllEvents();
      this.scene.start("CheckpointScene");
    }

    this.convoText.setText("");

    let currentEvent = this.eventsList[this.eventIndex];
    if (!currentEvent) return;

    if (currentEvent.type === 0) {
      // if (currentEvent.action != undefined) {
      //   if (currentEvent.action === 1) {
      //     this.startEnemyWaves();
      //   } else {
      //     this.stopEnemyWaves();
      //   }
      // }

      if (currentEvent.text) {
        this.playDialogue(currentEvent.text, () => {
          this.time.delayedCall(currentEvent.delay, () => {
            this.eventIndex++;
            this.processNextEvent();
          });
        });
      } else {
      }
    } else if (currentEvent.type === 1) {
      this.spawnEnemy(currentEvent.enemyType, currentEvent.x);
      this.time.delayedCall(currentEvent.delay, () => {
        this.eventIndex++;
        this.processNextEvent();
      });
    }
  }
}
