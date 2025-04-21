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

const offsetX = TILE_WIDTH / 2;
const offsetY = TILE_HEIGHT / 2;

export function createPlayerSystem(layer: PhaserLayer) {
    const {
        world,
        networkLayer: {
            components: { Position },
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

    type ExtendedPlayer = Exclude<typeof layer.custom.player, undefined>;

    defineEnterSystem(world, [Has(Position)], ({ entity }) => {
        console.log("Player Enter System, entity: ", entity);
        const playerObj = objectPool.get(entity, "Sprite") as ExtendedPlayer;

        // Get position
        const position = getComponentValueStrict(Position, entity);
        const pixelPosition = tileCoordToPixelCoord(
            position,
            TILE_WIDTH,
            TILE_HEIGHT
        );
        pixelPosition.x += offsetX;
        pixelPosition.y += offsetY;

        // Draw the space ship
        playerObj.setComponent({
            id: "sprite",
            once: (sprite) => {
                sprite.setOrigin(0.5, 0.5);
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
            ? (layer.custom.player as ExtendedPlayer)
            : (objectPool.get(entity, "Sprite") as ExtendedPlayer);

        // Get position
        const position = getComponentValueStrict(Position, entity);
        const pixelPosition = tileCoordToPixelCoord(
            position,
            TILE_WIDTH,
            TILE_HEIGHT
        );
        pixelPosition.x += offsetX;
        pixelPosition.y += offsetY;

        // Calculate rotation value based on movement direction
        const dx = pixelPosition.x - playerObj.position.x;
        const dy = pixelPosition.y - playerObj.position.y;

        let rotationVal = 0;
        if (dx === 0 && dy > 0) {
            rotationVal = Math.PI; // Down
        } else if (dx > 0 && dy === 0) {
            rotationVal = Math.PI / 2; // Right
        } else if (dx === 0 && dy < 0) {
            rotationVal = 0; // Up
        } else if (dx < 0 && dy === 0) {
            rotationVal = (Math.PI * 3) / 2; // Left
        }

        // Correct the position
        playerObj.setComponent({
            id: "position",
            once: (sprite) => {
                sprite.setRotation(rotationVal);
                sprite.setPosition(pixelPosition.x, pixelPosition.y);
            },
        });

        if (isThePlayer(entity, layer)) {
            playerObj.x = playerObj.position.x;
            playerObj.y = playerObj.position.y;
        }
    });
}
