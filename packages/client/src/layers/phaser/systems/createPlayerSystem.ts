import { PhaserLayer } from "../createPhaserLayer";
import {
    TILE_WIDTH,
    TILE_HEIGHT,
    TILE_SIZE,
    Sprites,
    Direction,
    MAP_CONFIG,
    Animations,

} from "../constants";
import { isThePlayer, localPlayer, stringToEntity } from "../utils";
import {
    tileCoordToPixelCoord,
    pixelCoordToTileCoord,
    pixelToChunkCoord,
} from "@latticexyz/phaserx";
import {
    Has,
    defineEnterSystem,
    defineUpdateSystem,
    getComponentValueStrict,
    getComponentValue,
    defineSystem,
    getComponentEntities,
} from "@latticexyz/recs";





const offsetX = TILE_WIDTH / 2;
const offsetY = TILE_HEIGHT / 2;

let isAiming = false;
let guideLine!: Phaser.GameObjects.Graphics;
let guideTiles!: Phaser.GameObjects.Graphics;
let arrowTip!: Phaser.GameObjects.Triangle;
let bullets: Phaser.Physics.Arcade.Group;
let keyX!: Phaser.Input.Keyboard.Key;
let lastPath: { x: number; y: number }[] = [];


const getRandomInt = (min: number, max: number): number => {
    return (
        Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
        Math.ceil(min)
    );
};

function getLineTiles(x0: number, y0: number, x1: number, y1: number) {
  const tiles: { x: number; y: number }[] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    tiles.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 <  dx) { err += dx; y0 += sy; }
  }
  return tiles;
}



export function createPlayerSystem(layer: PhaserLayer) {
    const {
        world,
        networkLayer: {
            components: { Position,Planet,Stats,IsDead, OwnedBy },
            systemCalls: { spawn, death, move,PlayerAttack },
        },
        scenes: {
            Main: {
                input,
                objectPool,
                config,
                camera: { phaserCamera },
                phaserScene,
            },
        },
    } = layer;

    //preload images
    phaserScene.load.image("flag","./assets/death/flag.png");

    //preload spritesheet

    phaserScene.load.spritesheet("bullet", "/assets/planets/Bullet.png", {
        frameWidth: 32,
        frameHeight: 48,
    });

    for (let i = 0; i < 10; i++) {
        phaserScene.load.image(`explode_${i}`, `./assets/explosions/${i}.png`);
    }

    // Ensure all the resources (spritesheets) is loaded
    phaserScene.load.once("complete", () => {
        // Define the animation
        phaserScene.anims.create({
            key: "bullet_anim", // Unique key for the animation
            frames: phaserScene.anims.generateFrameNumbers("bullet", {
                start: 0, // Start frame index
                end: 5, // End frame index (adjust based on your spritesheet)
            }),
            frameRate: 12, // Frames per second
            repeat: 0, // Repeat indefinitely (-1 for infinite loop)
        });
    });

    const createAnim = () => {
  // đóng gói frame thành AnimationFrame[]
    const frames: Phaser.Types.Animations.AnimationFrame[] = [];

    for (let i = 0; i <= 9; i++) {
        frames.push({ key: `explode_${i}` });
    }

    // tạo animation
    phaserScene.anims.create({
        key: 'explode',
        frames,
        frameRate: 12,
        repeat: 0,
        hideOnComplete: true
    });
    }

    // Custom Method to init a new player
    layer.custom.methods.initPlayer = async () => {
        // Get random position
        const pos = {
            x: getRandomInt(0, MAP_CONFIG.WIDTH_TILE),
            y: getRandomInt(0, MAP_CONFIG.HEIGHT_TILE),
        };

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
            // else console.log(`keycode: ${key.keyCode}`);
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

        //Draw only localPlayer - hide position of the other
        // const localId=localPlayer(layer);
        // if(!localId)
        // {
        //     playerObj.setComponent({
        //         id: "sprite",
        //         once: (sprite) => {
        //             sprite.setVisible(false); // Hide the player sprite
        //             // sprite.setOrigin(0.5, 0.5);
        //             // sprite.setTexture(
        //             //     config.sprites[Sprites.SpaceShip].assetKey,
        //             //     config.sprites[Sprites.SpaceShip].frame
        //             // );
        //             // sprite.setDepth(1);
        //         },
        //     });
        //     return;
        // }

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
                // sprite.setVisible(true);
                sprite.setVisible(isThePlayer(entity,layer));
                sprite.setOrigin(0.5, 0.5);
                sprite.setTexture(
                    config.sprites[Sprites.SpaceShip].assetKey,
                    config.sprites[Sprites.SpaceShip].frame
                );
                // sprite.play(Animations.Ship);
                sprite.setDepth(1);
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
    //movement system
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
            // rotationVal = 0; // Down
        } else if (dx > 0 && dy === 0) {
            rotationVal = Math.PI / 2; // Right
        } else if (dx === 0 && dy < 0) {
            rotationVal = 0; // Up
        } else if (dx < 0 && dy === 0) {
            rotationVal = (Math.PI * 3) / 2; // Left
        }

        const visibleChunks = pixelToChunkCoord(pixelPosition, 64 * 32);
        console.log(visibleChunks);

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
    

    //Define the system when player died - Having many problems need fixing
    defineUpdateSystem(world, [Has(IsDead)], ({ entity }) => {
        const stats = getComponentValue(Stats, entity);
        if (!stats) return;
        const isDead = getComponentValue(IsDead,entity);
        if (!isDead) return;
        const localId=localPlayer(layer);
        // if (!localId) return;
        // If the player is dead, call the death system
        if (stats.health <= 0) {

            // set invisible Player
            
            // const playerEntity = stringToEntity(localId);
            const playerObj = isThePlayer(entity, layer)
            ? (layer.custom.player as ExtendedPlayer)
            : (objectPool.get(entity, "Sprite") as ExtendedPlayer);
            playerObj.setComponent({
                id: "sprite",
                once: (sprite) => {
                    sprite.setVisible(false); // Hide the player sprite
                    // sprite.setOrigin(0.5, 0.5);
                    // sprite.setTexture(
                    //     config.sprites[Sprites.SpaceShip].assetKey,
                    //     config.sprites[Sprites.SpaceShip].frame
                    // );
                    // sprite.setDepth(1);
                },
            });
            const positionData = getComponentValueStrict(Position, entity);
            const pixel = tileCoordToPixelCoord(positionData, TILE_WIDTH, TILE_HEIGHT);
            pixel.x += TILE_WIDTH / 2;
            pixel.y += TILE_HEIGHT / 2;
            phaserScene.add
                .image(pixel.x, pixel.y, 'flag')
                .setOrigin(0.5, 1)    // chỗ neo giữa đáy, tuỳ chỉnh
                .setDepth(5)
                .setScale(0.2); // Tỉ lệ của hình ảnh

            // death(localId);
        }
    });

    // Option 1:Define when a player attacks a planet - Not implement ZK proof yet
    // input.keyboard$.subscribe(async (key: Phaser.Input.Keyboard.Key) => {
    //     if (key.isDown && key.keyCode === 65) // 'A' key for attack
    //     try {
    //         // // testing
    //         // const rand= Math.floor(Math.random() * 6)*10;
    //         // phaserScene.add
    //         // .image(200+rand, 200+rand, 'flag')
    //         // .setOrigin(0.5, 1)    // chỗ neo giữa đáy, tuỳ chỉnh
    //         // .setDepth(5)
    //         // .setScale(0.2); // Tỉ lệ của hình ảnh
    //             defineEnterSystem(world, [Has(Stats)], ({ entity }) => {
    //                 const planet = [...Planet.entities()];
    //                 for (const planetId of planet) {
    //                     const planetData = getComponentValueStrict(Planet, planetId);
    //                     const posData = getComponentValue(Position, entity);
    //                     if (!posData) continue;
    //                     // if (!PlanetAttack(planet.x,planet.y,10,planet.power, playerId)) continue;
    //                     // start the shooting animation and convert to pixel coordinates
    //                     const planet = tileCoordToPixelCoord(
    //                         { x: planetData.x, y: planetData.y },
    //                         TILE_WIDTH,
    //                         TILE_HEIGHT
    //                     );

    //                     // end the shooting animation and convert to pixel coordinates
    //                     const player = tileCoordToPixelCoord(
    //                         { x: posData.x, y: posData.y },
    //                         TILE_WIDTH,
    //                         TILE_HEIGHT
    //                     );
    //                     const dx =planetData.x > posData.x ? planetData.x - posData.x : posData.x - planetData.x;
    //                     const dy = planetData.y > posData.y ? planetData.y - posData.y : posData.y - planetData.y;
    //                     if (!(dx + dy  <= 15)) continue;
    //                     // animate the attack
    //                     // const rand= Math.floor(Math.random() * 6)*10;
    //                     // phaserScene.add
    //                     // .image(200+rand, 200+rand, 'flag')
    //                     // .setOrigin(0.5, 1)    // chỗ neo giữa đáy, tuỳ chỉnh
    //                     // .setDepth(5)
    //                     // .setScale(0.2); // Tỉ lệ của hình ảnh
    //                     // //
    //                     PlayerAttack(planetId);
    //                 }
    //             });
    //         }
    //         catch (error) {
    //             console.log("Error: Cannot attack, ", error);
    //         }

    //     });


    // Option 2: Define when a player attacks a planet - Implement ZK proof

    input.keyboard$.subscribe(async (key: Phaser.Input.Keyboard.Key) => {
        if (key.isDown && key.keyCode === 65) // 'A' key for attack
        try {
             // Lấy entity của người chơi hiện tại
            const playerId = localPlayer(layer);
            if (!playerId) return;


            const playerEntity = stringToEntity(playerId);
            // Lấy stats của attacker
            const stats = getComponentValueStrict(Stats, playerEntity);
            const posData = getComponentValue(Position, playerEntity);
            if (!stats || !posData) return;

            // Tìm các hành tinh trong phạm vi tấn công
            const planets = [...Planet.entities()];
            for (const planetId of planets) {
                const planetData = getComponentValueStrict(Planet, planetId);
                const ownedByData = getComponentValueStrict(OwnedBy, planetId);
                if (!planetData) continue;

                const dx = Math.abs(planetData.x - posData.x);
                const dy = Math.abs(planetData.y - posData.y);
                if (dx + dy > 15) continue;
                if (ownedByData.PlayerId === playerId) continue; // Không tấn công hành tinh của chính mình
                // PlayerAttack(planetId);
                // Nếu hành tinh chưa có chủ, gọi PlayerAttack
                if (ownedByData.PlayerId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    PlayerAttack(planetId);
                } 
                else {
                    //testing 
                    
                    
                    try{
                        // Gửi energy attacker lên server prover
                        const response = await fetch("http://localhost:8080/attack", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                attacker: playerId,
                                energy: stats.energy,
                                x: posData.x,
                                y: posData.y,
                                planetId: planetId
                            })
                        });
                    }
                    catch (error) {
                        //testing
                        // console.log("Error: Cannot attack, ", error);
                        alert("Lỗi gửi request: " + error);
                        console.log("Error: Cannot attack, ", error);
                        // const rand1= Math.floor(Math.random() * 6)*10;
                        // phaserScene.add
                        // .image(200+rand1, 200+rand1, 'flag')
                        // .setOrigin(0.5, 1)    // chỗ neo giữa đáy, tuỳ chỉnh
                        // .setDepth(5)
                        // .setScale(0.2); // Tỉ lệ của hình ảnh
                        continue;
                    }
                    //testing
                    // const rand= Math.floor(Math.random() * 10)*10;
                    // phaserScene.add
                    // .image(200+rand, 200+rand, 'flag')
                    // .setOrigin(0.5, 1)    // chỗ neo giữa đáy, tuỳ chỉnh
                    // .setDepth(5)
                    // .setScale(0.2); // Tỉ lệ của hình ảnh
                }
            }
            }
            catch (error) {
                console.log("Error: Cannot attack, ", error);
            }

        });

    const create = () => {
        guideTiles=phaserScene.add.graphics();
        guideTiles.setVisible(false);

        keyX=phaserScene.input.keyboard!.addKey("X");
    };

    const update = () => {
        // Bật/tắt guide khi nhấn X
        if (Phaser.Input.Keyboard.JustDown(keyX)) {
            isAiming = !isAiming;
            guideTiles.visible = isAiming;
            if (!isAiming) {
                guideTiles.clear();
            }
        }
        phaserScene.events.on('update', () => {
        // Khi đang aiming, vẽ line từ player đến con trỏ
            if (isAiming) {
                //clear old line
                guideTiles.clear();


                const player = localPlayer(layer);
                const playerEntity=stringToEntity(player);
                const positionData = getComponentValue(Position, playerEntity);
                if (!positionData) return;
                

                const pointer = phaserScene.input.activePointer;

                // 3. Tọa độ ô của con trỏ
                const tileX = Math.floor(pointer.worldX / TILE_WIDTH);
                const tileY = Math.floor(pointer.worldY / TILE_HEIGHT);

                // 4. Tính dãy ô Bresenham và vẽ
                // const lineTiles = getLineTiles(positionData.x, positionData.y, tileX, tileY);
                lastPath = getLineTiles(positionData.x, positionData.y, tileX, tileY);
                for (const { x, y } of lastPath) {
                    if(x == positionData.x && y == positionData.y) continue;
                    guideTiles.strokeRect(
                        x * TILE_WIDTH,
                        y * TILE_HEIGHT,
                        TILE_WIDTH,
                        TILE_HEIGHT
                    );
                }

                // guideLine.clear();
                // guideLine.lineStyle(2, 0x999966, 1);
                // guideLine.beginPath();
                // guideLine.moveTo(pixel.x, pixel.y);
                // guideLine.lineTo(pointer.worldX, pointer.worldY);
                // guideLine.strokePath();
            }
        });
    }


    // define when player attack player
    create();
    
    input.keyboard$.subscribe(async (key: Phaser.Input.Keyboard.Key) => {
        if (key.isDown && key.keyCode === 88)
        {
            update();
        }
    });


    createAnim();

    input.pointerdown$.subscribe(async ({ pointer, event }) => {
        if (pointer.leftButtonDown() && isAiming)
        {
            const player = localPlayer(layer);
            const playerEntity=stringToEntity(player);
            const positionData = getComponentValue(Position, playerEntity);
            if (!positionData) return;

            for (const { x, y } of lastPath) {
                if(x == positionData.x && y == positionData.y) continue;
                let pixel=tileCoordToPixelCoord(
                    {x,y},
                    TILE_WIDTH,
                    TILE_HEIGHT
                )
            }
                
                // phaserScene.add.image(pixel.x + TILE_WIDTH / 2,pixel.y + TILE_HEIGHT/2,'explode_0');
                // const explosion = phaserScene.add.sprite(pixel.x + TILE_WIDTH / 2,pixel.y + TILE_HEIGHT/2, 'explode_0');
                // explosion.play('explode');
                // phaserScene.time.

            try{
                    // Gửi energy attacker lên server prover
                const response = await fetch("http://localhost:8080/hit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        list: lastPath,
                        attacker: player,
                        attacker_x: positionData.x,
                        attacker_y: positionData.y,
                    })
                });
            }
            catch (error) {
                alert("Lỗi gửi request: " + error);
            }
            // }
        }
    });
}












