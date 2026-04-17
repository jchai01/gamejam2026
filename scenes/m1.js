// for setData method, store additional data for gameObject as key value pair
const DATA_KEYS = Object.freeze({
  ROTATION_SPEED: "ROTATION_SPEED", // for random asteroid rotation
});

export class M1Scene extends Phaser.Scene {
  constructor() {
    super({ key: "M1Scene" });

    this.storyScript = [
      {
        text: "SYSTEM ALERT:\nDestination Locked | Kepler-268 Alpha",
        delay: 1000,
      },
      {
        text: "ADAM:\nRecover the Helios Drive Crystal.\nIt enables stable energy output, forming the Pacemaker’s\nprimary power source.",
        delay: 1000,
      },
      {
        text: "Pilot:\nEasy... sounds like a piece of ca-",
        delay: 700,
      },
      {
        text: "ADAM:\nWarning! Class-5 Asteroid Belt in high orbit detected.",
        delay: 500,
      },
      {
        text: "ADAM:\nMaintain thruster control via [Arrow Keys].\nShoot with [SPACE]",
        delay: 700,
      },
      {
        text: "ADAM:\nTry not to scratch the paint. Good luck.",
        delay: 800,
      },
      {
        text: "",
        delay: 10000,
      },
      {
        // let the asteroid settle down first
        text: "",
        delay: 1000,
      },
      {
        text: "ADAM: Mission accomplished!",
        delay: 500,
      },
    ];
  }

  init() { }

  preload() {
    //load assets
    // key, url
    this.load.image("player", "assets/player.png");
    this.load.image("asteroid", "assets/asteroid.png");
    this.load.image("bullet", "assets/bullet.png");

    // load audio assets/ spritesheets
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create() {
    // load using key
    this.gameW = this.scale.width;

    // when to use const when to use this? not explained in tutorial
    // const player = this.add.image(0, 0, "player");
    this.player = this.physics.add.image(0, 0, "player");

    this.player.setPosition(this.gameW / 2, 900);
    this.player.setScale(this.registry.get("shipWidth"));
    // player.setOrigin(100, 100);

    this.player.setDepth(3);
    this.player.health = 3;
    this.player.isInvincible = false;

    // This prevents the player from leaving the game area
    this.player.setCollideWorldBounds(true);

    this.enemyGroup = this.physics.add.group([]);

    this.bulletGroup = this.physics.add.group([]);
    this.lastBulletFiredTime = 0;

    // Spawn in game
    // let bullet = this.bullets.get(this.player.x, this.player.y);
    // if (bullet) {
    //   bullet.setActive(true);
    //   bullet.setScale(0.2);
    //   bullet.setVisible(true);
    //   bullet.body.velocity.y = -200;
    // }

    // works for scaling too
    // asteroid.scaleX = 2;
    // asteroid.scaleY = 2;

    // use setter methods
    // this.asteroid.setScale(2);
    // this.asteroid.setScale(2,2);

    // alter the width
    // asteroid.displayWidth = 400;

    // flip
    // asteroid.flipX = true;
    // asteroid.flipY = true;

    // angle any sprites
    // player.angle = 45;

    // using radians
    // player.setOrigin(0); // set origin before rotating, set to top-left corner in this case
    // this.player.rotation = Math.PI / 4; // 45 degree

    // time left before next stage
    // this.time.addEvent({
    //   delay: 20000,
    //   callback: () => {
    //     this.scene.start("CheckpointScene"); // Scene to change to
    //   },
    //   callbackScope: this,
    // });

    this.isComplete = false;

    this.physics.add.overlap(
      this.bulletGroup,
      this.enemyGroup,
      this.handleBulletAndEnemyCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.enemyGroup,
      this.handlePlayerAndEnemyCollision,
      null,
      this, // Tells Phaser 'this' refers to the Scene
    );

    this.storyIndex = 5;

    this.convoText = this.add
      .text(10, 200, "", {
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
      tint: [0x00ff00, 0x44ff44, 0xffffff], // random between 3 colors, green sparks
    });
    this.bulletEmitter.setDepth(5);

    this.explosionEmitter = this.add.particles(0, 0, "white_dot", {
      lifespan: 400,
      speed: { min: 100, max: 600 },
      scale: { start: 3, end: 0.2 },
      color: [0xffff00, 0xff8800, 0xff0000], // particles change color over their life!
      colorEase: "quad.out",
      emitting: false,
      blendMode: "ADD",
    });
    this.bulletEmitter.setDepth(5);

    this.starEmitter = this.add.particles(0, 0, "white_dot", {
      x: { min: 0, max: 540 }, // spawn randomly between 0 and 540
      y: { min: 0, max: 0 },
      lifespan: 5000,
      speedY: { min: 100, max: 200 },
      scale: { min: 0.2, max: 0.7 },
      alpha: { start: 0.8, end: 0.3 },
      frequency: 150, // How often to spawn a new star (lower = more stars)
      blendMode: "ADD",
    });
    this.starEmitter.setDepth(1);

    // ensure stars already fill the screen
    for (let i = 0; i < 100; i++) {
      this.starEmitter.fastForward(100);
    }
  } // end create

  // update method gives the time of our game.
  update(time) {
    const moveAmount = 600;

    // 1. Reset velocity every frame
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
      if (this.player.health >= 0) {
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

    this.enemyGroup.getChildren().forEach((enemy) => {
      if (
        enemy.active &&
        (enemy.x < 0 ||
          enemy.x > this.scale.width ||
          enemy.y < 0 ||
          enemy.y > this.scale.height)
      ) {
        enemy.setActive(false).setVisible(false);
      }
      enemy.rotation += enemy.getData(DATA_KEYS.ROTATION_SPEED);
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

    // create game object if not found,x,y, texture, frame number, visibility
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
      .setScale(Phaser.Math.FloatBetween(0.2, 0.4))
      .setVelocity(0, Phaser.Math.Between(300, 600))
      .setData(DATA_KEYS.ROTATION_SPEED, Phaser.Math.FloatBetween(-0.04, 0.04))
      .setData("hp", 5);
  }

  handleBulletAndEnemyCollision(bullet, enemy) {
    this.bulletEmitter.explode(10, bullet.x, bullet.y);

    bullet.disableBody();
    bullet.setActive(false).setVisible(false);

    let currentHp = enemy.getData("hp");
    if (currentHp <= 0) {
      // Subtract damage
      this.explosionEmitter.explode(30, enemy.x, enemy.y);
      enemy.disableBody();
      enemy.setActive(false).setVisible(false);
    } else {
      currentHp -= 1;
      enemy.setData("hp", currentHp);

      enemy.setTint(0xff5555);
      this.tweens.add({
        targets: enemy,
        alpha: 1,
        duration: 100,
        onComplete: () => {
          enemy.clearTint(); // Remove tint after 100ms
        },
      });
    }
  }

  handlePlayerAndEnemyCollision(player, enemy) {
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);
    this.explosionEmitter.explode(30, enemy.x, enemy.y);

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
        player.setTint(0xff2222); // Turn red momentarily

        this.tweens.add({
          targets: player,
          alpha: 0.4,
          duration: 100, // Speed of flicker
          ease: "Linear",
          yoyo: true, // Go back to full opacity
          repeat: 3, // Number of flickers (Total time = 100ms * 2 * 5 = 1 sec)
          onComplete: () => {
            player.isInvincible = false;
            player.clearTint();
            player.alpha = 1; // Ensure player is fully visible at the end
          },
        });
      }
    }
  }

  playStory() {
    if (this.storyIndex >= this.storyScript.length) return;

    const line = this.storyScript[this.storyIndex];
    let charIndex = 0;
    this.convoText.setText(""); // Clear previous text

    if (this.storyIndex === 5) {
      this.startEnemyWaves();
    }
    if (this.storyIndex === 7) {
      this.stopEnemyWaves();
    }

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

  startEnemyWaves() {
    this.enemyTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnenemy,
      callbackScope: this,
      loop: true,
    });
  }

  stopEnemyWaves() {
    if (this.enemyTimer) {
      this.enemyTimer.remove();
    }
  }
}
