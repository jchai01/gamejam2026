export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });

    this.story =
      "The Sun is dying. It is not exploding.\n \
      It is not fading away.\n \
      It is losing its rhythm-like a heart slowly stopping. \n \
      Days grow shorter. \n \
      Temperatures drop. \n \
      Earth is slipping into darkness. \n\n \
      Humanity’s last hope: The Stellar Pacemaker. \n \
      A machine designed to restore the Sun’s pulse \n \
      and keep it alive. \n \
      But it cannot be built on Earth. \n\n \
      To guide this mission, \n \
      humanity created its most advanced AI: \n \
      ADAM ";
  }

  preload() {
    // load a intro cutscene
    // this.load.video("intro", "assets/cutscene.mp4");
  }

  create() {
    const gameW = this.scale.width;

    this.skipKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    // play video exmaple
    // const video = this.add.video(400, 300, "intro");
    // video.play();

    // video.on("complete", () => {
    //   this.scene.start("MenuScene");
    // });

    this.add
      .text(gameW / 2, 400, this.story, {
        fontSize: "18px",
        align: "center",
        fontFamily: "Monospace",
        wordWrap: { width: 600, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    this.add
      .text(gameW / 2, 820, "SPACE to skip", { fontSize: "38px" })
      .setOrigin(0.5);

    this.skipKey.once("down", () => {
      // this.transitionToGame();
      if (this.video) {
        this.video.stop();
        this.video.destroy();
      }

      // Move to the next scene
      this.scene.start("MenuScene");
    });
  }
}

// transitionToGame() {
// }
