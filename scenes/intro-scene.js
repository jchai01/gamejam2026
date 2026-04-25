export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  preload() {
    this.load.font('orbitron', 'assets/fonts/orbitron.ttf', 'truetype');
    this.load.image("intro1", "assets/images/intro1.png");
    this.load.image("intro2", "assets/images/intro2.png");
    this.load.image("intro3", "assets/images/intro3.png");
    this.load.image("menuBg1", "assets/images/menuBg1.png");
    this.load.image("earth", "assets/images/earth.png");
  }

  create() {
    this.display = this.add.image(this.scale.width / 2, this.scale.height / 2, "intro1");

    this.add
      .text(this.scale.width / 2, 880, "SPACE to skip", { fontSize: "32px", fontFamily: 'Orbitron' })
      .setOrigin(0.5).setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);


    this.storyText = this.add.text(this.scale.width / 2, this.scale.height * 0.8, "", {
      fontSize: "34px",
      fontStyle: "Bold",
      fontFamily: "Orbitron",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: this.scale.width * 0.9 }
    }).setOrigin(0.5);
    this.storyText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5).setLineSpacing(10);

    this.skipKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    this.timeline = this.add.timeline([
      {
        at: 0,
        run: () => {
          this.storyText.setX(this.scale.width / 2).setY(700);
          this.display.setTexture("intro1");
          this.typewriteText("Year: 3000\nThe sun is dying...\nslowly losing it's rhythm.");
        },
        tween:
        {
          targets: this.display,
          alpha: { from: 0, to: 1, duration: 1000 },
          scale: { from: 1, to: 1.1, duration: 3500 },
        },
      },
      {
        at: 3500,
        run: () => {
          this.display.setTexture('intro2');
          this.storyText.setX(this.scale.width / 2).setY(this.scale.height / 2);
          this.typewriteText("Temperature drop.\nDays grew shorter.\nEarth is slipping into darkness.");
        },
        tween: { targets: this.display, scale: { from: 1, to: 1.1 }, duration: 4000 }
      },
      {
        at: 7500,
        run: () => {
          this.display.setTexture('menuBg1');
          this.storyText.setX(this.scale.width / 2).setY(150);
          this.typewriteText("Humanity's Last hope:\n THE STELLAR PACEMAKER");
        },
        tween: { targets: this.display, scale: { from: 1.2, to: 1.1 }, duration: 3500 }
      },
      {
        at: 11000,
        run: () => {
          this.display.setTexture('intro3');
          this.storyText.setX(this.scale.width / 2).setY(250);
          this.typewriteText("But...\nThis machine is like a hungry God, and Earth is quickly running out of resources.");
        },
        tween: { targets: this.display, scale: { from: 1.0, to: 1.2 }, duration: 5000 }
      },
      {
        at: 16000,
        run: () => {
          this.display.setTexture('earth');
          this.typewriteText("You are tasked to retrieve what is needed from distant planets.");
        },
        tween: { targets: this.display, scale: { from: 1.0, to: 1.2 }, duration: 10000 }
      },
      {
        at: 20000,
        run: () => {
          this.display.setTexture('earth');
          this.typewriteText("Guided by humanity's most advanced AI:");
        },
      },
      {
        at: 23000,
        run: () => {
          this.storyText.setFontSize('86px');
          this.storyText.setX(this.scale.width / 2).setY(this.scale.height / 2);
          this.typewriteText("A.D.A.M");
        }
      },
      {
        // buffer time, so it doesn't switch scene immediately
        at: 26000,
      },
    ]);

    this.timeline.play();
    // this.timeline.elapsed = 17000;

    this.timeline.on('complete', () => {
      this.scene.start("MenuScene");
    });

    this.skipKey.once("down", () => {
      this.scene.start("MenuScene");
    });
  }

  typewriteText(text) {
    this.storyText.setText("");
    let charIndex = 0;

    if (this.typeTimer) this.typeTimer.remove();

    this.typeTimer = this.time.addEvent({
      delay: 40,
      repeat: text.length - 1,
      callback: () => {
        this.storyText.text += text[charIndex];
        charIndex++;
      }
    });
  }
}

