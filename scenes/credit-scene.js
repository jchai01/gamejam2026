export class CreditScene extends Phaser.Scene {
  constructor() {
    super({ key: "CreditScene" });
  }

  create() {
    this.add
      .text(this.scale.width / 2, 800, "SPACE to continue", {
        fontFamily: "Orbitron",
        fontSize: "28px",
        fontStyle: "Bold",
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => {
      this.sound.stopAll();
      this.scene.start("MenuScene");
    });

    this.creditText = this.add.text(this.scale.width / 2, 400, "Game by:\nJoseph Chai\n\nGraphics and Art by:\nYu Qi Chen\n\nMusic Composed by:\nNathan Chai\n\nProgramming by:\nJoseph Chai\nViet Pham", {
      fontSize: "20px",
      fontStyle: "Bold",
      fontFamily: "Orbitron",
      align: "center",
    }).setOrigin(0.5);
    this.creditText.setLineSpacing(10);

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture("white_dot", 8, 8);

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
  }
}
