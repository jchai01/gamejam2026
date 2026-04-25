export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" }); // The unique key for this scene
  }

  preload() {
    this.load.image("menuBg1", "assets/images/menuBg1.png");
    this.load.image("menuBg2", "assets/images/menuBg2.png");
    this.load.image("menuBg3", "assets/images/menuBg3.png");
    this.load.image("menuBg4", "assets/images/menuBg4.png");

    this.load.audio('menuTheme', 'assets/music/menuTheme.mp3');
  }

  create() {
    // 1. Try to find the existing sound instance in the global manager
    let menuMusic = this.sound.get('menuTheme');
    let missionMusic = this.sound.get('missionTheme');

    if (missionMusic) {
      if (missionMusic.isPlaying) {
        missionMusic.stop();
      }
    }

    if (!menuMusic) {
      // 2. If it doesn't exist at all, create it and play it
      this.music = this.sound.add('menuTheme');
      this.music.play({
        loop: true,
        volume: 0.5
      });
    } else {
      // 3. If it exists, link your local variable to it
      this.music = menuMusic;

      // 4. If it's paused or not playing for some reason, start it
      if (!this.music.isPlaying) {
        this.music.play();
      }
    }

    // this.sound.stopAll();
    // this.music = this.sound.add('menuTheme');
    //
    // this.music.play({
    //   loop: true,   // Keep the music going
    //   volume: 0.5,  // 50% volume
    //   delay: 0      // Start immediately
    // });


    if (!this.registry.has("stage")) {
      this.registry.set("stage", 1);
    }

    // different bg for each mission
    if (this.registry.get("stage") == 1) {
      this.add.image(0, 0, 'menuBg1').setOrigin(0);
      this.add
        .text(this.scale.width / 2, 100, "Mission 1", {
          fontSize: "38px", fontStyle: "Bold",
        })
        .setOrigin(0.5).setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    }
    else if (this.registry.get("stage") == 2) {
      this.add.image(0, 0, 'menuBg2').setOrigin(0);
      this.add
        .text(this.scale.width / 2, 100, "Mission 2", {
          fontSize: "38px", fontStyle: "Bold",
        })
        .setOrigin(0.5).setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    }
    else if (this.registry.get("stage") == 3) {
      this.add.image(0, 0, 'menuBg3').setOrigin(0);
      this.add
        .text(this.scale.width / 2, 100, "Mission 3", {
          fontSize: "38px", fontStyle: "Bold",
        })
        .setOrigin(0.5).setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    } else {
      this.add
        .text(this.scale.width / 2, 100, "Mission 4", {
          fontSize: "38px", fontStyle: "Bold",
        })
        .setOrigin(0.5).setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
      this.add.image(0, 0, 'menuBg4').setOrigin(0);

    }
    this.registry.set("shipWidth", 0.035);

    this.add
      .text(this.scale.width / 2, 180, "SPACE to take off", {
        fontSize: "38px",
        fontStyle: "Bold",
      })
      .setOrigin(0.5).setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

    this.input.keyboard.once("keydown-SPACE", () => {
      if (this.registry.get("stage") === 1) {
        this.scene.start("M1Scene");
      } else if (this.registry.get("stage") >= 2) {
        this.scene.start("M2Scene");
      }
    });

    // FOR DEBUGGING
    this.input.keyboard.on("keydown-TWO", () => {
      this.scene.start("M1ReturnScene");
    });
    this.input.keyboard.on("keydown-THREE", () => {
      this.registry.set("stage", 2);
      this.scene.start("M2Scene");
    });
    this.input.keyboard.on("keydown-FOUR", () => {
      this.registry.set("stage", 2);
      this.scene.start("M2ReturnScene");
    });
    this.input.keyboard.on("keydown-FIVE", () => {
      this.registry.set("stage", 3);
      this.scene.start("M2Scene");
    });
    this.input.keyboard.on("keydown-SIX", () => {
      this.registry.set("stage", 3);
      this.scene.start("M2ReturnScene");
    });
    this.input.keyboard.on("keydown-SEVEN", () => {
      this.registry.set("stage", 4);
      this.scene.start("M2Scene");
    });
    this.input.keyboard.on("keydown-EIGHT", () => {
      this.registry.set("stage", 4);
      this.scene.start("CheckpointScene");
    });
  }
}
