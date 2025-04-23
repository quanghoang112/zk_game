import { PhaserLayer } from "../createPhaserLayer";
// import { getChunksInArea, loadChunks } from "@latticexyz/phaserx";

export function createDebugSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: {
                phaserScene,
                // camera,
            },
        },
    } = layer;

    const SCREEN_WIDTH = window.innerWidth;

    // Log FPS
    (() => {
        const text = "FPS: 00.00";
        const fpsText = phaserScene.add.text(SCREEN_WIDTH - 100, 10, text, {
            fontFamily: "MinecraftPixel",
        });
        fpsText.setScrollFactor(0);
        phaserScene.time.addEvent({
            delay: 1000, // Log every second
            loop: true,
            callback: () => {
                fpsText.setText(
                    `FPS: ${phaserScene.game.loop.actualFps.toFixed(2)}`
                );
                fpsText.updateText();
            },
        });
    })();

    // Load images
    phaserScene.load.image("spawn_button", "/assets/buttons/spawn_button.png");

    phaserScene.load.once("complete", () => {
        const buttonImage = phaserScene.add.image(0, 0, "spawn_button");
        const scaleValue = 3;
        buttonImage.setScale(scaleValue);
        const width = SCREEN_WIDTH - buttonImage.width * scaleValue;
        buttonImage.setPosition(width, 70);
        buttonImage.setScrollFactor(0);

        buttonImage.setInteractive({
            useHandCursor: true,
            hitArea: new Phaser.Geom.Rectangle(
                0,
                0,
                buttonImage.width,
                buttonImage.height
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });

        // Add a click event
        buttonImage.on("pointerdown", () => {
            layer.custom.methods.initPlayer();
        });

        // Add hover effects
        buttonImage.on("pointerover", () => {
            buttonImage.setTint(0xaaaaaa);
        });

        // Clear hover effects
        buttonImage.on("pointerout", () => {
            buttonImage.clearTint();
        });
    });

    phaserScene.load.start();
}
