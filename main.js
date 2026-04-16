import { IntroScene } from "./scenes/intro-scene.js";
import { MenuScene } from "./scenes/menu-scene.js";
import { M1Scene } from "./scenes/m1.js";
import { M1ReturnScene } from "./scenes/m1-return.js";
import { CheckpointScene } from "./scenes/checkpoint-scene.js";

const config = {
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },

  scene: [
    IntroScene,
    MenuScene,
    M1Scene, // M1 - Mission 1
    M1ReturnScene,
    CheckpointScene,
  ],
  scale: {
    width: 540,
    height: 960,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#000000",
};

const game = new Phaser.Game(config);
