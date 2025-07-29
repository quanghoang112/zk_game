import Phaser from "phaser";
import {
    defineSceneConfig,
    AssetType,
    defineScaleConfig,
    defineMapConfig,
    defineCameraConfig,
} from "@latticexyz/phaserx";
import worldTileset from "/assets/tilesets/spaces_debug.png";
import { TileAnimations, Tileset, } from "../../artTypes/spaces_debug";
import {
    Sprites,
    Assets,
    Maps,
    Scenes,
    TILE_HEIGHT,
    TILE_WIDTH,
    Animations,
} from "./constants";

const ANIMATION_INTERVAL = 200;

const mainMap = defineMapConfig({
    chunkSize: TILE_WIDTH * 64, // tile size * tile amount
    tileWidth: TILE_WIDTH,
    tileHeight: TILE_HEIGHT,
    backgroundTile: [Tileset.Cobblestone],
    animationInterval: ANIMATION_INTERVAL,
    tileAnimations: TileAnimations,
    layers: {
        layers: {
            Background: { tilesets: ["Default"] },
            MouseHoverEffect: { tilesets: ["Default"] },
            Foreground: { tilesets: ["Default"] },
        },
        defaultLayer: "Background",
    },
});

export const phaserConfig = {
    sceneConfig: {
        [Scenes.Main]: defineSceneConfig({
            assets: {
                [Assets.Tileset]: {
                    type: AssetType.Image,
                    key: Assets.Tileset,
                    path: worldTileset,
                },
                [Assets.MainAtlas]: {
                    type: AssetType.MultiAtlas,
                    key: Assets.MainAtlas,
                    // Add a timestamp to the end of the path to prevent caching
                    path: `/assets/atlases/atlas.json?timestamp=${Date.now()}`,
                    options: {
                        imagePath: "/assets/atlases/",
                    },
                },
            },
            maps: {
                [Maps.Main]: mainMap,
            },
            sprites: {
                [Sprites.SpaceShip]: {
                    assetKey: Assets.MainAtlas,
                    frame: "sprites/space_ship/idle/0.png",
                },
            },
            animations: [
                {
                    key: Animations.Explosions,
                    assetKey: Assets.MainAtlas,
                    startFrame: 1,
                    endFrame: 10,
                    frameRate: 20,
                    repeat: -1,
                    prefix: "sprites/explosion/",
                    suffix: ".png",
                },
                {
                    key: Animations.Ship,
                    assetKey: Assets.MainAtlas,
                    startFrame: 1,
                    endFrame: 1,
                    frameRate: 20,
                    repeat: -1,
                    prefix: "sprites/space_ship/idle/",
                    suffix: ".png",
                }
            ],
            tilesets: {
                Default: {
                    assetKey: Assets.Tileset,
                    tileWidth: TILE_WIDTH,
                    tileHeight: TILE_HEIGHT,
                },
            },
        }),
    },
    scale: defineScaleConfig({
        parent: "phaser-game",
        zoom: 1,
        mode: Phaser.Scale.NONE,
    }),
    cameraConfig: defineCameraConfig({
        pinchSpeed: 1,
        wheelSpeed: 1,
        maxZoom: 3,
        minZoom: 1,
    }),
    cullingChunkSize: TILE_HEIGHT * 32,
};
