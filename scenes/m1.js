// for setData method, store additional data for gameObject as key value pair
const DATA_KEYS = Object.freeze({
  ROTATION_SPEED: "ROTATION_SPEED", // for random asteroid rotation
});

export class M1Scene extends Phaser.Scene {
  constructor() {
    super({ key: "M1" });

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
        delay: 1000,
      },
      {
        text: "ADAM:\nWarning! Class-5 Asteroid Belt in high orbit detected.",
        delay: 500,
      },
      {
        text: "ADAM:\nMaintain thruster control via [Arrow Keys].",
        delay: 500,
      },
      {
        text: "ADAM:\nTry not to scratch the paint. Good luck.",
        delay: 500,
      },
      {
        text: "",
        delay: 10000,
        visible: false,
      },
      {
        // let the asteroid settle down first
        text: "",
        delay: 1000,
        visible: false,
      },
      {
        text: "ADAM: Mission accomplished!",
        delay: 500,
        visible: false,
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
    const gameW = this.scale.width;
    // const gameH = this.scale.height;

    // when to use const when to use this? not explained in tutorial
    // const player = this.add.image(0, 0, "player");
    this.player = this.physics.add.image(0, 0, "player");

    this.player.setPosition(gameW / 2, 900);
    // player.setPosition(gameW - 100, gameH - 100);
    // player.setOrigin(100, 100);

    // z value, higher means will be in front
    this.player.setDepth(3);

    this.player.setScale(0.2, 0.2);
    this.playerHealth = 3;

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

    this.storyIndex = 0;
    this.convoText = this.add
      .text(10, 200, "", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left",
        // backgroundColor: "#000000bb", // Slight transparency for readability
      })
      .setOrigin(0, 0)
      .setDepth(10); // text always stays on top

    // 3. Typewriter Effect
    // const fullMessage = "Intercepting transmission... Signal locked.";
    // let charIndex = 0;
    //
    // this.time.addEvent({
    //   delay: 20,
    //   repeat: fullMessage.length - 1,
    //   callback: () => {
    //     this.convoText.text += fullMessage[charIndex];
    //     charIndex++;
    //   },
    // });

    // if (this.storyIndex >= this.storyScript.length) {
    //   this.scene.start("CheckpointScene"); // Scene to change to
    // } else {
    //   this.playStory();
    // }
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

    //increase scale
    // this.player.scaleX -= 0.01;

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
      .setScale(Phaser.Math.FloatBetween(0.1, 0.5))
      .setVelocity(0, Phaser.Math.Between(300, 600))
      .setData(DATA_KEYS.ROTATION_SPEED, Phaser.Math.FloatBetween(-0.04, 0.04));

    // enemy.body.setSize(enemy.displayWidth * 0.3, enemy.displayHeight * 0.3);

    console.log(this.enemyGroup.getChildren().length);
  }

  handleBulletAndEnemyCollision(bullet, enemy) {
    this.bulletEmitter.explode(10, bullet.x, bullet.y);
    this.explosionEmitter.explode(20, enemy.x, enemy.y);

    bullet.disableBody();
    bullet.setActive(false).setVisible(false);
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);
  }

  handlePlayerAndEnemyCollision(player, enemy) {
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);

    if (this.playerHealth <= 0) {
      console.log("Game over");
    } else {
      this.playerHealth -= 1;
      console.log("HEALTH LEFT:" + this.playerHealth);
    }
  }

  playStory() {
    if (this.storyIndex >= this.storyScript.length) return;

    const line = this.storyScript[this.storyIndex];
    let charIndex = 0;
    this.convoText.setText(""); // Clear previous text

    if (this.storyIndex === 4) {
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
      return; // Skip the typewriter event
    }

    // 1. Start typewriter effect for this specific line
    this.time.addEvent({
      delay: 30,
      repeat: line.text.length - 1,
      callback: () => {
        this.convoText.text += line.text[charIndex];
        charIndex++;

        // 2. Once the line is finished, wait, then call playStory(index + 1)
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
