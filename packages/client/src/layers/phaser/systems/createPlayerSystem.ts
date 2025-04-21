import { PhaserLayer } from "../createPhaserLayer";
import { TILE_WIDTH, TILE_HEIGHT, Sprites, Direction } from "../constants";
import { isThePlayer } from "../utils";
import {
    pixelCoordToTileCoord,
    tileCoordToPixelCoord,
} from "@latticexyz/phaserx";
import {
    Has,
    defineEnterSystem,
    defineUpdateSystem,
    getComponentValueStrict,
} from "@latticexyz/recs";

const getRandomInt = (min: number, max: number): number => {
    return (
        Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
        Math.ceil(min)
    );
};

export function createPlayerSystem(layer: PhaserLayer) {
    const {
        world,
        networkLayer: {
            components: {
                Position,
            },
            systemCalls: { spawn, move },
        },
        scenes: {
            Main: {
                input,
                objectPool,
                config,
                camera: { phaserCamera },
            },
        },
    } = layer;

    // Custom Method to init a new player
    layer.custom.methods.initPlayer = async () => {
        const window_width = window.innerWidth;
        const window_height = window.innerHeight;

        // Get random position
        const x = getRandomInt(window_width / 2, (window_width * 3) / 4);
        const y = getRandomInt(window_height / 2, (window_height * 3) / 4);
        const pos = pixelCoordToTileCoord({ x, y }, TILE_WIDTH, TILE_HEIGHT);

        try {
            await spawn(pos.x, pos.y);
        } catch (error) {
            console.log("Error: Cannot spawn player, ", error);
        }
    };

    input.keyboard$.subscribe(async (key: Phaser.Input.Keyboard.Key) => {
        let dir = Direction.Unknown;

        if (key.isDown) {
            if (key.keyCode == 37) dir = Direction.Left;
            else if (key.keyCode == 38) dir = Direction.Down;
            else if (key.keyCode == 39) dir = Direction.Right;
            else if (key.keyCode == 40) dir = Direction.Up;
            else console.log(`keycode: ${key.keyCode}`);
        }

        if (dir !== Direction.Unknown) {
            try {
                await move(dir);
            } catch (error) {
                console.log("Error: Cannot move the player, ", error);
            }
        }
    });

    defineEnterSystem(world, [Has(Position)], ({ entity }) => {
        console.log("Player Enter System, entity: ", entity);
        const playerObj = objectPool.get(
            entity,
            "Sprite"
        ) as typeof layer.custom.player;

        // Get position
        const position = getComponentValueStrict(Position, entity);
        const pixelPosition = tileCoordToPixelCoord(
            position,
            TILE_WIDTH,
            TILE_HEIGHT
        );

        // Draw the space ship
        playerObj.setComponent({
            id: "sprite",
            once: (sprite) => {
                sprite.setTexture(
                    config.sprites[Sprites.SpaceShip].assetKey,
                    config.sprites[Sprites.SpaceShip].frame
                );
            },
        });

        // Set position
        playerObj.setComponent({
            id: "position",
            once: (sprite) => {
                sprite.setPosition(pixelPosition.x, pixelPosition.y);
            },
        });

        if (isThePlayer(entity, layer)) {
            layer.custom.player = playerObj;
            layer.custom.player.spawn();
            layer.custom.player.x = layer.custom.player.position.x;
            layer.custom.player.y = layer.custom.player.position.y;
            phaserCamera.startFollow(layer.custom.player, true, 0.1, 0.1);
        }
    });

    defineUpdateSystem(world, [Has(Position)], ({ entity }) => {
        const playerObj = isThePlayer(entity, layer)
            ? layer.custom.player
            : (objectPool.get(entity, "Sprite") as typeof layer.custom.player);

        // Get position
        const position = getComponentValueStrict(Position, entity);
        const pixelPosition = tileCoordToPixelCoord(
            position,
            TILE_WIDTH,
            TILE_HEIGHT
        );

        // Correct the position
        playerObj.setComponent({
            id: "position",
            once: (sprite) => {
                sprite.setPosition(pixelPosition.x, pixelPosition.y);
            },
        });

        if (isThePlayer(entity, layer)) {
            playerObj.x = playerObj.position.x;
            playerObj.y = playerObj.position.y;
        }

        const chunkSize = TILE_WIDTH * 64;
        console.log(`Entity position: ${pixelPosition.x}, ${pixelPosition.y}`);
        console.log(
            `Chunk: ${Math.floor(pixelPosition.x / chunkSize)}, ${Math.floor(pixelPosition.y / chunkSize)}`
        );
    });
}
