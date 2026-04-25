export class CheckpointScene extends Phaser.Scene {
  constructor() {
    super({ key: "CheckpointScene" });

    this.textArr = [
      "Extracted Helios Drive Crystal.",
      "Extracted Aero Stabilite",
      "Magnetar Flux Core",
      "Congratulations, Pilot. You saved the Earth!",
    ];
  }

  preload() {
    this.load.image("resourceBg", "assets/images/resource.png");
    this.load.image("earth", "assets/images/earth.png");
    this.load.image("ship", "assets/images/spaceshipBack.png");
  }

  create() {

    if (this.registry.get("stage") < 4) {
      this.resourceBg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'resourceBg');
      this.resourceBg.setDepth(-1);

      // different crop level, to define the extracted resource
      if (this.registry.get("stage") === 1) {
        this.resourceBg.setCrop(0, 0, 500, 350);
      } else if (this.registry.get("stage") === 2) {
        this.resourceBg.setCrop(0, 0, 500, 650);
      }

      this.time.addEvent({
        delay: 4000,
        callback: () => {
          this.nextStage();
        },
        callbackScope: this,
      });

    } else {
      // final mission complete
      this.earth = this.add.image(this.scale.width / 2, this.scale.height / 2, 'earth');
      this.earth.setDepth(-1);

      this.ship = this.add.image(this.scale.width / 2, 700, 'ship');

      this.tweens.add({
        targets: this.ship,
        scale: 0.2,
        duration: 20000,
        ease: 'Power1'
      });

      this.storyText = this.add.text(this.scale.width / 2, 200, "", {
        fontSize: "20px",
        fontStyle: "Bold",
        fontFamily: "Orbitron",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: this.scale.width * 0.9 }
      }).setOrigin(0.5);
      this.storyText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5).setLineSpacing(10);

      this.timeline = this.add.timeline([
        {
          at: 0,
          run: () => {
            this.typewriteText("Pilot:\nCommand, ADAM's down, he has gone rogue. He tried to sell me on some asteroid threat-");

          },
        },
        {
          at: 4500,
          run: () => {
            this.typewriteText("Ground Command:\nA high-density cluster in Nemesis Fringe? Our current tech is able to confirm it.\nIn 20 years, it hits the moon.");
          },
        },
        {
          at: 11000,
          run: () => {
            this.typewriteText("Pilot:\nTh- that's... exactly where he said...\nthe pacemaker- what have I done...");
          },
        },
        {
          at: 15000,
          run: () => {
            this.typewriteText("Ground Command:\nWe’re reading a massive spike in your vitals. Pilot?? Do you copy?");
          },
        },
        {
          at: 20000,
        },

      ]);

      this.timeline.play();
      // this.timeline.elapsed = 17000;

      this.timeline.on('complete', () => {
        this.registry.set("stage", 1);
        this.scene.start("MenuScene");
      });
    }


    this.skipKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    // this.statusText = this.add
    //   .text(200, 500, "", {
    //     font: "28px Arial",
    //     fill: "#ffffff",
    //     backgroundColor: "#000000bb",
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(10);

    // -1 to match textArr
    // const fullMessage = this.textArr[this.registry.get("stage") - 1];
    // let charIndex = 0;

    // this.time.addEvent({
    //   delay: 100,
    //   repeat: fullMessage.length - 1,
    //   callback: () => {
    //     this.statusText.text += fullMessage[charIndex];
    //     charIndex++;
    //   },
    // });

    // this.add
    //   .text(200, 720, "SPACE to skip", { fontSize: "42px" })
    //   .setOrigin(0.5);

    this.skipKey.once("down", () => {
      this.nextStage();
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

  nextStage() {
    if (this.registry.get("stage") === 1) {
      this.scene.start("M1ReturnScene");
    }
    else if (this.registry.get("stage") === 2 || this.registry.get("stage") === 3) {
      this.scene.start("M2ReturnScene");
    }
    else {
      // game complete
      this.registry.set("stage", 1);
      this.scene.start("MenuScene");
    }
  }
}
