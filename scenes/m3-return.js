export class M3ReturnScene extends Phaser.Scene {
  constructor() {
    super({ key: "M3ReturnScene" });

    this.storyScript = [
      {
        text: "Mission 3 Return start",
        delay: 2000,
        visible: false,
      },
      {
        text: "ADAM: Mission accomplished!",
        delay: 500,
        visible: false,
      },
    ];
  }

  init() {}

  preload() {
    this.load.image("player", "assets/player.png");
    this.load.image("asteroid", "assets/asteroid.png");
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create() {
    const gameW = this.scale.width;
    const gameH = this.scale.height;

    const bg = this.add.image(0, 0, "background");
    bg.setPosition(gameW / 2, gameH / 2);

    this.player = this.physics.add.image(0, 0, "player");
    this.player.setPosition(gameW / 2, 0);
    this.player.setScale(this.registry.get("shipWidth"));

    this.player.flipY = true;
    this.player.setCollideWorldBounds(true);

    this.storyIndex = 0;
    this.convoText = this.add
      .text(10, 200, "", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left",
      })
      .setOrigin(0, 0)
      .setDepth(10);

    this.playStory();
  }

  update() {
    const moveAmount = 400;
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

    if (this.storyIndex >= this.storyScript.length && !this.isComplete) {
      this.isComplete = true;
      this.time.delayedCall(2000, () => {
        this.registry.set("stage", 4);
        this.scene.start("MenuScene");
      });
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
