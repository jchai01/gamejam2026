export class CheckpointScene extends Phaser.Scene {
  constructor() {
    super({ key: "CheckpointScene" });
  }

  preload() { }

  create() {
    this.skipKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    this.statusText = this.add
      .text(200, 500, "", {
        font: "28px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000bb", // Slight transparency for readability
      })
      .setOrigin(0.5)
      .setDepth(10);

    const fullMessage = "Magic Ore Extracted...";
    let charIndex = 0;

    this.time.addEvent({
      delay: 100,
      repeat: fullMessage.length - 1,
      callback: () => {
        this.statusText.text += fullMessage[charIndex];
        charIndex++;
      },
    });

    this.add
      .text(200, 720, "SPACE to skip", { fontSize: "42px" })
      .setOrigin(0.5);

    this.skipKey.once("down", () => {
      // this.transitionToGame();
      if (this.video) {
        this.video.stop();
        this.video.destroy();
      }

      // Move to the next scene
      this.scene.start("EscapeScene");
    });

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.scene.start("EscapeScene");
      },
      callbackScope: this,
    });
  }
}

// transitionToGame() {
// }
