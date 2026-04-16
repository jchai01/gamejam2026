export class M1ReturnScene extends Phaser.Scene {
  constructor() {
    super({ key: "EscapeScene" });
  }

  init() { }

  preload() {
    //load assets
    // key, url
    this.load.image("player", "assets/player.png");
    this.load.image("asteroid", "assets/asteroid.png");

    // load audio assets/ spritesheets

    // spritesheet exmpale
    // this.load.spritesheet("dude", "assets/dude.png", {
    //   frameWidth: 32,
    //   frameHeight: 48,
    // });

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create() {
    // load using key
    const gameW = this.scale.width;
    const gameH = this.scale.height;

    const bg = this.add.image(0, 0, "background");
    bg.setPosition(gameW / 2, gameH / 2);

    // change origin to top-left corner
    // bg.setOrigin(0, 0);

    // const player = this.add.image(0, 0, "player");
    this.player = this.physics.add.image(0, 0, "player");

    this.player.setPosition(gameW / 2, 0);
    // player.setPosition(gameW - 100, gameH - 100);
    // player.setOrigin(100, 100);

    // z value, higher means will be in front
    // this.player.setDepth(3);

    this.player.setScale(0.2, 0.2);
    this.player.flipY = true;

    this.asteroid = this.add.image(250, 180, "asteroid");
    this.asteroid.setScale(0.5, 0.5);

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

    // This prevents the player from leaving the game area
    this.player.setCollideWorldBounds(true);

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.registry.set("stage", 2);
        this.scene.start("MenuScene"); // Scene to change to
      },
      callbackScope: this,
    });
  }

  update() {
    const moveAmount = 400;

    // stops the player on cursor key up
    // this.player.setDrag(2000);

    this.asteroid.angle += 1;

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
  }
}
