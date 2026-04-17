const ENEMY_TYPES = {
  ASTEROID: 0,
  TYPE1: 1,
  TYPE2: 2,
};

class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
  }

  launch(x, y, pattern) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    if (this.body) {
      this.body.enable = true;
    }

    this.startPattern(pattern);

    // You can use 'pattern' here to set different behaviors
    if (pattern === "zigzag") {
      // Add a simple tween or sine wave logic
    }
  }

  damage(amount) {
    this.hp -= amount;

    this.setTint(0xff0000);
    this.scene.time.delayedCall(50, () => this.clearTint());

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    if (this.scene.explosionEmitter) {
      this.scene.explosionEmitter.explode(20, this.x, this.y);
    }
    // return to pool
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
    this.hp = 3;
  }

  startPattern() {
    console.log("START");
    this.setVelocityY(200); // Scouts just fly down fast
  }
}

class Type1Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy1");
    this.hp = 5;
    this.setScale(0.2);
  }

  startPattern() {
    this.setVelocityY(200);
  }
}

class Type2Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy1");
    this.hp = 5;
    this.setScale(0.2);
  }

  startPattern() {
    this.setVelocityY(200);
  }
}

const DATA_KEYS = Object.freeze({
  ROTATION_SPEED: "ROTATION_SPEED",
});

const ENEMY_MAP = {
  [ENEMY_TYPES.ASTEROID]: AsteroidEnemy,
  [ENEMY_TYPES.TYPE1]: Type1Enemy,
  [ENEMY_TYPES.TYPE2]: Type2Enemy,
};

export class M2Scene extends Phaser.Scene {
  constructor() {
    super({ key: "M2Scene" });

    this.levelTimer = 0;
    this.spawnQueue = [];
    this.storyScript = [
      {
        text: "SYSTEM ALERT:\nDestination Locked | Centauri X-7",
        delay: 1000,
      },

      {
        text: "Mission 2 start!",
        delay: 1000,
      },
      {
        text: "",
        delay: 10000,
        visible: false,
      },
      {
        text: "Mission accomplised.",
        delay: 10000,
      },
    ];
  }

  init() { }

  preload() {
    this.load.image("player", "assets/player.png");
    this.load.image("asteroid", "assets/asteroid.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("enemy1", "assets/enemy1.png");

    this.load.json("data", "assets/data/m2.json");

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

    this.pools = {};

    Object.keys(ENEMY_MAP).forEach((typeID) => {
      const EnemyClass = ENEMY_MAP[typeID];

      this.pools[typeID] = this.physics.add.group({
        classType: EnemyClass,
        maxSize: 20,
        runChildUpdate: true,
      });
    });

    this.bulletGroup = this.physics.add.group([]);
    this.lastBulletFiredTime = 0;

    this.isComplete = false;

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
      }
    });

    this.storyIndex = 0;
    this.convoText = this.add
      .text(50, 200, "", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left",
      })
      .setOrigin(0, 0)
      .setDepth(10);
    this.playStory();

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
    const data = this.cache.json.get("data").enemies;

    // time given in json file should be in order, sort just in case.
    this.spawnQueue = data.sort((a, b) => a.time - b.time);
  } // end create

  update(time, delta) {
    this.levelTimer += delta;

    while (
      this.spawnQueue.length > 0 &&
      this.levelTimer >= this.spawnQueue[0].time
    ) {
      const data = this.spawnQueue.shift();

      const targetPool = this.pools[data.type];
      if (targetPool) {
        const enemy = targetPool.get();
        if (enemy) {
          enemy.launch(data.x, -50, data.pattern);
        }
      }
    }

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
      this.fireBullet();
      this.lastBulletFiredTime = time;
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

    if (this.storyIndex >= this.storyScript.length && !this.isComplete) {
      this.isComplete = true;
      this.time.delayedCall(2000, () => {
        this.scene.start("CheckpointScene");
      });
    }
  }

  fireBullet() {
    const x = this.player.x;
    const y = this.player.y;

    const bullet = this.bulletGroup.getFirstDead(true, x, y, "bullet", 0, true);
    bullet.setActive(true).setVisible(true).setScale(1).enableBody();
    bullet.setVelocityY(-1000);

    // check if object pooling is working
    // console.log(this.bulletGroup.getChildren().length);
  }

  spawnenemy() {
    let x = Phaser.Math.Between(0, this.scale.width);
    let y = 0;
    const enemy = this.enemyGroup.getFirstDead(true, x, y, "asteroid", 0, true);
    enemy
      .setActive(true)
      .setVisible(true)
      .enableBody()
      .setScale(Phaser.Math.FloatBetween(0.1, 0.5))
      .setVelocity(0, Phaser.Math.Between(300, 600))
      .setData(DATA_KEYS.ROTATION_SPEED, Phaser.Math.FloatBetween(-0.04, 0.04));
  }

  handleBulletAndEnemyCollision(bullet, enemy) {
    this.bulletEmitter.explode(10, bullet.x, bullet.y);
    this.explosionEmitter.explode(20, enemy.x, enemy.y);

    bullet.disableBody();
    bullet.setActive(false).setVisible(false);

    // if enemy has damage method
    if (enemy.damage) {
      enemy.damage(1);
    }
  }

  handlePlayerAndEnemyCollision(player, enemy) {
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);

    if (this.player.health <= 0) {
      console.log("Game over");
    } else {
      this.player.health -= 1;
      console.log("HEALTH LEFT:" + this.player.health);
    }
  }

  playStory() {
    if (this.storyIndex >= this.storyScript.length) return;

    const line = this.storyScript[this.storyIndex];
    let charIndex = 0;
    this.convoText.setText("");

    if (line.text === "") {
      this.time.delayedCall(line.delay, () => {
        this.storyIndex++;
        this.playStory();
      });
      return;
    }

    this.time.addEvent({
      delay: 30,
      repeat: line.text.length - 1,
      callback: () => {
        this.convoText.text += line.text[charIndex];
        charIndex++;

        if (charIndex === line.text.length) {
          this.storyIndex++;
          this.time.delayedCall(line.delay, () => {
            this.playStory();
          });
        }
      },
    });
  }
}
