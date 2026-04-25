const DATA_KEYS = Object.freeze({
  ROTATION_SPEED: "ROTATION_SPEED", // for random asteroid rotation
});

export class M1ReturnScene extends Phaser.Scene {
  constructor() {
    super({ key: "M1ReturnScene" });
  }

  init() { }

  preload() {
    this.load.image("player", "assets/images/player.png");
    this.load.image("asteroid", "assets/images/asteroid.png");
    this.load.image("bullet", "assets/images/bullet.png");
    this.load.image("enemyBullet", "assets/images/enemyBullet.png");
    this.load.image("pirate", "assets/images/enemy1.png");
    this.load.image("warning_icon", "assets/images/warning_icon.png");

    this.load.audio('missionTheme', 'assets/music/missionTheme.mp3');

    if (this.cache.json.exists("levelData")) {
      this.cache.json.remove("levelData");
    }
    this.load.json("levelData", "assets/data/m1-return.json");

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create() {
    if (!this.sound.get('missionTheme')) {
      this.sound.stopAll();
      this.music = this.sound.add('missionTheme');
      this.music.play({
        loop: true,
        volume: 0.5
      });
    }

    this.player = this.physics.add.image(0, 0, "player");
    this.player.flipY = true;
    this.player.setPosition(this.scale.width / 2, 100);
    this.player.setScale(this.registry.get("shipWidth"));
    this.player.setDepth(3);
    this.player.shield = 3;
    this.player.isInvincible = false;
    this.player.setCollideWorldBounds(true);
    this.pirateLeft = 3;
    this.pirateChasing = false;

    this.shieldText = this.add.text(20, 920, `Shield: ${this.player.shield}`, {
      fontSize: "24px",
    });

    this.asteroidGroup = this.physics.add.group({
      defaultKey: "asteroid",
      maxSize: 20,
    });
    this.pirateGroup = this.physics.add.group({
      defaultKey: "pirate",
      maxSize: 3,
    });
    this.pirateBulletGroup = this.physics.add.group({
      defaultKey: "enemyBullet",
      maxSize: 20,
    });

    this.wasAfterburning = false;
    this.afterburner = false;

    this.bulletGroup = this.physics.add.group([]);
    this.lastBulletFiredTime = 0;

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
      this.pirateGroup,
      this.handlePlayerAndEnemyCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.asteroidGroup,
      this.pirateGroup,
      this.handleAsteroidAndPirateCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.bulletGroup,
      this.pirateGroup,
      this.handleBulletAndEnemyCollision,
      null,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.pirateBulletGroup,
      this.handlePlayerHitByPirateBullet,
      null,
      this,
    );


    this.eventsList = this.cache.json.get("levelData").events;
    this.eventIndex = 0;

    this.convoText = this.add
      .text(10, 750, "", {
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
      tint: [0x00ff00, 0x44ff44, 0xffffff], // random between 3 colors, green sparks
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
      x: { min: 0, max: 540 }, // spawn randomly between 0 and 540
      y: { min: 960, max: 960 },
      lifespan: 10000,
      speedY: { min: -100, max: -200 },
      // scale: { start: 0.2, end: 0.7 },
      // alpha: { start: 0.2, end: 0.7 },
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

    if (this.cursorKeys.space.isDown && time > this.lastBulletFiredTime + 100) {
      if (this.player.shield > 0 && !this.afterburner) {
        this.fireBullet();
        this.lastBulletFiredTime = time;
      }
    }

    if (this.afterburner && !this.wasAfterburning) {
      this.starEmitter.updateConfig({
        speedY: -1000,
        lifespan: 2000,
        frequency: 30,
        scaleX: 0.1,
        scaleY: 1.5,
      });
      this.wasAfterburning = true;
      this.enemyTimer.delay = 3000;
    } else if (!this.afterburner && this.wasAfterburning) {
      this.wasAfterburning = false;
      this.enemyTimer.delay = 500;
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

    this.pirateGroup.getChildren().forEach((pirate) => {
      if (!pirate.active) return;
      if (
        pirate.x < -50 ||
        pirate.x > this.scale.width + 50 ||
        pirate.y < -50 ||
        pirate.y > this.scale.height + 100
      ) {
        pirate.setActive(false).setVisible(false);
        return;
      }
      if (this.player.active) {
        this.physics.moveToObject(pirate, this.player, 180);
        const now = this.time.now;
        if (now > (pirate.getData("nextFire") || 0)) {
          this.firePirateBullet(pirate);
          pirate.setData("nextFire", now + 2000);
        }
      }
    });

    this.pirateBulletGroup.getChildren().forEach((bullet) => {
      if (
        bullet.active &&
        (bullet.x < 0 ||
          bullet.x > this.scale.width ||
          bullet.y < 0 ||
          bullet.y > this.scale.height)
      ) {
        bullet.setActive(false).setVisible(false).disableBody();
      }
    });

    if (this.afterburner && this.pirateLeft > 0 && !this.pirateChasing) {
      this.spawnPirate();
    }
  }

  fireBullet() {
    const x = this.player.x;
    const y = this.player.y;
    // create game object if not found,x,y, texture, frame number, visibility
    const bullet = this.bulletGroup.getFirstDead(true, x, y, "bullet", 0, true);
    bullet.setActive(true).setVisible(true).setScale(1).enableBody();
    bullet.setVelocityY(1000);
  }

  spawnWarning() {
    let x = Phaser.Math.Between(50, this.scale.width - 50);
    const warning = this.add.sprite(x, 900, "warning_icon");
    warning.setScale(0.5).setTint(0xff0000); // Make it red

    this.tweens.add({
      targets: warning,
      alpha: 0,
      duration: 200,
      ease: "Linear",
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        warning.destroy();
        this.spawnAsteroid(x);
      },
    });
  }

  spawnAsteroid(x) {
    const asteroid = this.asteroidGroup.getFirstDead(
      true,
      x,
      this.scale.height + 50,
      "asteroid",
      0,
      true,
    );

    if (this.afterburner) {
      asteroid.setVelocity(0, -1000);
    } else {
      const speedY = Phaser.Math.Between(-200, -400);
      const speedX = Math.random() < 0.2 ? Phaser.Math.Between(-150, 150) : 0;
      asteroid.setVelocity(speedX, speedY);
    }

    asteroid
      .setActive(true)
      .setVisible(true)
      .enableBody()
      .setScale(1)
      .setData(DATA_KEYS.ROTATION_SPEED, Phaser.Math.FloatBetween(-0.04, 0.04))
      .setData({ hp: 3, type: "asteroid" });
  }

  handleBulletAndEnemyCollision(bullet, enemy) {
    this.bulletEmitter.explode(10, bullet.x, bullet.y);

    bullet.disableBody();
    bullet.setActive(false).setVisible(false);

    let currentHp = enemy.getData("hp");
    if (currentHp <= 0) {
      this.explosionEmitter.explode(30, enemy.x, enemy.y);
      enemy.disableBody();
      enemy.setActive(false).setVisible(false);
      if (enemy.getData("type") === "pirate") {
        this.time.delayedCall(3000, () => { this.pirateChasing = false; });
      }
    } else {
      currentHp -= 1;
      enemy.setData("hp", currentHp);

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
  handleAsteroidAndPirateCollision(asteroid, pirate) {
    pirate.disableBody();
    pirate.setActive(false).setVisible(false);
    this.explosionEmitter.explode(30, pirate.x, pirate.y);

    asteroid.disableBody();
    asteroid.setActive(false).setVisible(false);
    this.explosionEmitter.explode(30, asteroid.x, asteroid.y);

    this.time.delayedCall(3000, () => {
      this.pirateChasing = false;
    });
  }

  handlePlayerAndEnemyCollision(player, enemy) {
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);
    this.explosionEmitter.explode(30, enemy.x, enemy.y);

    if (enemy.getData("type") == "pirate") {
      this.time.delayedCall(3000, () => {
        this.pirateChasing = false;
      });
    }

    if (this.player.shield <= 0) {
      // game over
      this.explosionEmitter.explode(30, player.x, player.y);
      player.disableBody();
      player.setActive(false).setVisible(false);

      this.add
        .text(this.scale.width / 2, 400, "Game Over", {
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
        this.player.shield -= 1;
        this.shieldText.setText(`Shield: ${this.player.shield}`);
        player.isInvincible = true;
        player.setTint(0xff2222);

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
    if (this.eventIndex >= this.eventsList.length) {
      this.registry.set("stage", 2);
      this.scene.start("MenuScene");
    }

    this.convoText.setText("");

    let currentEvent = this.eventsList[this.eventIndex];
    if (!currentEvent) return;

    if (currentEvent.type === 0) {
      if (currentEvent.action != undefined) {
        if (currentEvent.action === 1) {
          this.startAsteroidWaves();
        } else {
          this.stopAsteroidWaves();
        }
      }
      if (currentEvent.afterburner != undefined) {
        if (currentEvent.afterburner === 1) {
          this.afterburner = true;
        } else {
          this.afterburner = false;
        }
      }

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
    }
  }

  spawnPirate() {
    let x = Phaser.Math.Between(20, this.scale.width - 20);
    let y = 50;

    let pirate = this.pirateGroup.getFirstDead(true, x, y, "pirate", 0, true);
    this.pirateChasing = true;
    pirate
      .setActive(true)
      .setVisible(true)
      .enableBody()
      .setScale(0.25)
      .setVelocity(0)
      .setData({ hp: 1, type: "pirate", nextFire: this.time.now + 1500 });
  }

  firePirateBullet(pirate) {
    const bullet = this.pirateBulletGroup.getFirstDead(true, pirate.x, pirate.y);
    if (bullet) {
      bullet.setActive(true).setVisible(true).setScale(0.8).enableBody();
      this.physics.moveToObject(bullet, this.player, 500);
    }
  }

  handlePlayerHitByPirateBullet(player, bullet) {
    this.bulletEmitter.explode(10, bullet.x, bullet.y);
    bullet.disableBody();
    bullet.setActive(false).setVisible(false);

    if (this.player.shield <= 0) {
      this.explosionEmitter.explode(30, player.x, player.y);
      player.disableBody();
      player.setActive(false).setVisible(false);

      this.add
        .text(this.scale.width / 2, 400, "Game Over", {
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

  startAsteroidWaves() {
    this.enemyTimer = this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.afterburner) {
          this.spawnWarning(); // and eventually spawn asteroid
        } else {
          let x = Phaser.Math.Between(20, this.scale.width - 20);
          this.spawnAsteroid(x);
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  stopAsteroidWaves() {
    if (this.enemyTimer) {
      this.enemyTimer.remove();
    }
  }
}
