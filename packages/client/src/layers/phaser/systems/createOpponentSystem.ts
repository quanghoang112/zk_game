import { PhaserLayer } from "../createPhaserLayer";
import { TILE_WIDTH, TILE_HEIGHT } from "../constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
    Has,
    defineEnterSystem,
    // defineUpdateSystem,
    getComponentValueStrict,
} from "@latticexyz/recs";

export function createOpponentSystem(layer: PhaserLayer) {
    const {
        world,
        networkLayer: {
            components: { Opponent },
            // systemCalls: {  },
        },
        scenes: {
            Main: { phaserScene },
        },
    } = layer;

    // Load the fire spritesheet
    phaserScene.load.spritesheet("fire_planet", "/assets/planets/fire.png", {
        frameWidth: 32,
        frameHeight: 48,
    });

    // Ensure all the resources (spritesheets) is loaded
    phaserScene.load.once("complete", () => {
        // Define the animation
        phaserScene.anims.create({
            key: "fire_planet_spin", // Unique key for the animation
            frames: phaserScene.anims.generateFrameNumbers("fire_planet", {
                start: 0, // Start frame index
                end: 13, // End frame index (adjust based on your spritesheet)
            }),
            frameRate: 10, // Frames per second
            repeat: -1, // Repeat indefinitely (-1 for infinite loop)
        });
    });
    defineEnterSystem(world, [Has(Opponent)], ({ entity }) => {
        phaserScene.load.once("complete", () => {
            const opponentData = getComponentValueStrict(Opponent, entity);
            const pos = tileCoordToPixelCoord(
                { x: opponentData.x, y: opponentData.y },
                TILE_WIDTH,
                TILE_HEIGHT
            );
            const firePlanetSprite = phaserScene.add.sprite(
                pos.x,
                pos.y,
                "fire_planet"
            );
            firePlanetSprite.play("fire_planet_spin");

            // // Draw the affected area
            // const circle = phaserScene.add.circle(
            //     0,
            //     0,
            //     planetData.radius,
            //     0xff0000,
            //     0.1
            // );

            // // Draw outline
            // const outline = phaserScene.add.graphics();
            // outline.lineStyle(3, 0xff0000, 0.7);
            // outline.strokeCircle(0, 0, planetData.radius);

            // Area container
            // phaserScene.add.container(pos.x, pos.y, [circle, outline]);
            
            phaserScene.add.container(pos.x, pos.y);
        });
    });
}
