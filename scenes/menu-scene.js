export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" }); // The unique key for this scene
  }

  preload() {
    // this.load.image("button", "assets/play_button.png");
  }

  create() {
    // Initialize the global game state here
    if (!this.registry.has("stage")) {
      this.registry.set("stage", 1);
    }
    this.registry.set("shipWidth", 0.035);

    this.add.text(200, 200, "Menu screen", { fontSize: "42px" }).setOrigin(0.5);
    this.add
      .text(200, 800, "SPACE to start", { fontSize: "42px" })
      .setOrigin(0.5);

    // let playBtn = this.add.image(400, 300, "button").setInteractive();
    // let creditsBtn = this.add.image(400, 420, "button").setInteractive();
    //
    // playBtn.on("pointerdown", () => {
    //   this.scene.start("GameScene");
    // });
    //

    this.input.keyboard.once("keydown-SPACE", () => {
      if (this.registry.get("stage") === 1) {
        this.scene.start("M1Scene");
      } else if (this.registry.get("stage") === 2) {
        this.scene.start("M2Scene");
      } else if (this.registry.get("stage") === 3) {
        this.scene.start("M3Scene");
      }
    });

    //placeholder art
    let machine_placeholder = this.add.graphics();
    machine_placeholder.fillStyle(0xff0000, 1);
    machine_placeholder.fillRect(100, 300, 200, 200); // x, y, width, height

    let shuttle_placeholder = this.add.graphics();
    shuttle_placeholder.fillStyle(0x0000ff, 1);
    shuttle_placeholder.fillRect(400, 300, 100, 200);

    // FOR DEBUGGING
    this.input.keyboard.on("keydown-TWO", () => {
      this.scene.start("M1ReturnScene");
      this.registry.set("stage", 2);
    });
    this.input.keyboard.on("keydown-THREE", () => {
      this.scene.start("M2Scene");
    });
    this.input.keyboard.on("keydown-FOUR", () => {
      this.scene.start("M2ReturnScene");
    });
    this.input.keyboard.on("keydown-FIVE", () => {
      this.scene.start("M3Scene");
    });
    this.input.keyboard.on("keydown-SIX", () => {
      this.scene.start("M3ReturnScene");
    });
  }
}
