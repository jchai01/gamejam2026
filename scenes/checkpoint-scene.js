export class CheckpointScene extends Phaser.Scene {
  constructor() {
    super({ key: "CheckpointScene" });

    this.textArr = [
      "Extracted Helios Drive Crystal.",
      "Extracted Aero Stabilite",
      "Magnetar Flux Core",
    ];
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
        backgroundColor: "#000000bb",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // -1 to match textArr
    const fullMessage = this.textArr[this.registry.get("stage") - 1];
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
      // if (this.video) {
      //   this.video.stop();
      //   this.video.destroy();
      // }

      this.nextStage();
    });

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.nextStage();
      },
      callbackScope: this,
    });
  }

  nextStage() {
    if (this.registry.get("stage") === 1) {
      this.scene.start("M1ReturnScene");
    } else if (this.registry.get("stage") === 2) {
      this.scene.start("M2ReturnScene");
    } else {
      // change this, M2 for now
      this.scene.start("M2ReturnScene");
    }
  }
}
