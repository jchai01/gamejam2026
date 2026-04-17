import { IntroScene } from "./scenes/intro-scene.js";
import { MenuScene } from "./scenes/menu-scene.js";
import { CheckpointScene } from "./scenes/checkpoint-scene.js";
import { M1Scene } from "./scenes/m1.js";
import { M2Scene } from "./scenes/m2.js";
import { M3Scene } from "./scenes/m3.js";
import { M1ReturnScene } from "./scenes/m1-return.js";
import { M2ReturnScene } from "./scenes/m2-return.js";
import { M3ReturnScene } from "./scenes/m3-return.js";

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
    M2Scene,
    M2ReturnScene,
    M3Scene,
    M3ReturnScene,
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
