import { PhaserLayer } from "../createPhaserLayer";
import { TILE_WIDTH, TILE_HEIGHT } from "../constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {localPlayer} from "../utils";
import {
    Has,
    defineEnterSystem,
    defineUpdateSystem,
    defineQuery,
    defineSystem,
    getComponentValueStrict,
    getComponentValue,
    defineComponentSystem,
} from "@latticexyz/recs";



export function createPlanetSystem(layer: PhaserLayer) {
    const {
        world,
        networkLayer: {
            components: { Planet,Position, OwnedBy },
            systemCalls: {PlanetAttack  },
        },
        scenes: {
            Main: { 
                phaserScene,
                objectPool, 
            },
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

    // Load the shooting spritesheet
    phaserScene.load.spritesheet('bomb', '/assets/shooting/Bomb.png', {
        frameWidth: 32,
        frameHeight: 48,
    });

    // Ensure all the resources (spritesheets) is loaded
    phaserScene.load.once("complete", () => {
        // Define the animation
        phaserScene.anims.create({
            key: "planet_shooting", // Unique key for the animation
            frames: phaserScene.anims.generateFrameNumbers("bomb", {
                start: 0, // Start frame index
                end: 11, // End frame index (adjust based on your spritesheet)
            }),
            frameRate: 15, // Frames per second
            repeat: 0, // Repeat indefinitely (-1 for infinite loop)
        });
    });

    // Draw the affected area
    const circle = phaserScene.add.circle(
        0,
        0,
        undefined, // Radius will be set later
        undefined, // Fill color will be set later
        undefined // Alpha will be set later
    );

    // Draw outline
    const outline = phaserScene.add.graphics();


    // color of planet


    defineEnterSystem(world, [Has(Planet)], ({ entity }) => {
        const OwnedByData = getComponentValueStrict(OwnedBy, entity);
        const localPlayerEntity = localPlayer(layer);
        let colorPlanet: number=0xff0000; // Red for unowned planets or enemy's planets
        if(OwnedByData.PlayerId == localPlayerEntity)
        {
            colorPlanet=0x0000ff; // blue for owned planets by the local player
        }

        phaserScene.load.once("complete", () => {
            const planetData = getComponentValueStrict(Planet, entity);
            
            const pos = tileCoordToPixelCoord(
                { x: planetData.x, y: planetData.y },
                TILE_WIDTH,
                TILE_HEIGHT
            );
            const firePlanetSprite = phaserScene.add.sprite(
                pos.x,
                pos.y,
                "fire_planet"
            );
            firePlanetSprite.play("fire_planet_spin");

            // Affected area
            circle.setRadius(planetData.radius);
            circle.setFillStyle(colorPlanet, 0.1); // Set fill color and alpha
            // outline
            outline.lineStyle(3, colorPlanet, 0.7);
            outline.strokeCircle(0, 0, planetData.radius);
            // Area container
            phaserScene.add.container(pos.x, pos.y, [circle, outline]);
        });
    });

    let lastAttackTime = 0;
    // Define the update system for attacking planets
    defineUpdateSystem(world, [Has(Position)], ({entity}) => {
        const now = Date.now();
        if (now - lastAttackTime < 1000) return; // Tấn công mỗi 1 giây
        lastAttackTime = now;

        const allPlayers = [...Position.entities()];
        for (const planetId of Planet.entities()) {
            const planetData = getComponentValueStrict(Planet, planetId);
            const OwnedByData = getComponentValueStrict(OwnedBy, planetId);
            if (!planetData) continue;

            for (const playerId of allPlayers) {
                const posData = getComponentValue(Position, playerId);
                if (!posData) continue;
                // if (!PlanetAttack(planet.x,planet.y,10,planet.power, playerId)) continue;
                // start the shooting animation and convert to pixel coordinates
                const planet = tileCoordToPixelCoord(
                    { x: planetData.x, y: planetData.y },
                    TILE_WIDTH,
                    TILE_HEIGHT
                );

                // end the shooting animation and convert to pixel coordinates
                const player = tileCoordToPixelCoord(
                    { x: posData.x, y: posData.y },
                    TILE_WIDTH,
                    TILE_HEIGHT
                );
                const dx =planetData.x > posData.x ? planetData.x - posData.x : posData.x - planetData.x;
                const dy = planetData.y > posData.y ? planetData.y - posData.y : posData.y - planetData.y;
                if (!(dx + dy  <= 10)) continue;
                if (OwnedByData.PlayerId == playerId) continue; // Skip if the planet is owned by the player
                // Create the shooting sprite at the start position
                const shooting = phaserScene.add.sprite(planet.x, planet.y, 'bomb',0);
                shooting.setDepth(10);

                // Play the shooting animation
                const tw = phaserScene.tweens.add({
                    targets: shooting,
                    x: player.x+ TILE_WIDTH / 2, // Adjust to center the sprite
                    y: player.y+ TILE_HEIGHT / 2, // Adjust to center the sprite
                    duration: 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        shooting.play('planet_shooting');
                        shooting.once('animationcomplete-planet_shooting', () => {
                            shooting.destroy();
                        });
                        PlanetAttack(planetData.x,planetData.y,9,planetData.power, playerId);
                        // spawnImpactEffect(phaserScene, player.x, player.y, 'bomb');
                    },
                });

                // On complete of the tween, play the explosion animation
                // tw.on('complete', () => {
                //     shooting.destroy();
                //     spawnImpactEffect(phaserScene, end.x, end.y,'bomb');
                // });
                
            }
        }
        // createUISystem(layer);
            // }
        // }
    });

    // Define the system when planet was conquered by the player
    defineUpdateSystem(world, [Has(OwnedBy)], ({ entity }) => {
        const OwnedByData = getComponentValueStrict(OwnedBy, entity);
        if (!OwnedBy) return;

        const planetData = getComponentValueStrict(Planet, entity);
        const localPlayerEntity = localPlayer(layer);
        let FillColor: number = 0xff0000; // Red for unowned planets or enemy's planets

        if(OwnedByData.PlayerId == localPlayerEntity)
            FillColor=0x0000ff; // Blue for owned planets by the local player
        // if(OwnedByData.PlayerId=='') return;

        const pos = tileCoordToPixelCoord(
            { x: planetData.x, y: planetData.y },
            TILE_WIDTH,
            TILE_HEIGHT
        );
        // Draw the affected area
        circle.setRadius(planetData.radius);
        circle.setFillStyle(FillColor, 0.1);

        // Draw outline
        outline.lineStyle(3, FillColor, 0.7);
        outline.strokeCircle(0, 0, planetData.radius);

        // Area container
        phaserScene.add.container(pos.x, pos.y, [circle, outline]);
        // phaserScene.
        //testing 
        // const rand= Math.floor(Math.random() * 6)*10;
        // phaserScene.add
        // .image(200+rand, 200+rand, 'flag')
        // .setOrigin(0.5, 1)    // chỗ neo giữa đáy, tuỳ chỉnh
        // .setDepth(5)
        // .setScale(0.2); // Tỉ lệ của hình ảnh
    });

}
