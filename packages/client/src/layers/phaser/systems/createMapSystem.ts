import { getComponentValueStrict } from "@latticexyz/recs";
import { Tileset } from "../../../artTypes/spaces_debug";
import { PhaserLayer } from "../createPhaserLayer";
import { MAP_CONFIG } from "../constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { createNoise2D } from "simplex-noise";
import seedrandom from "seedrandom";
import { random } from "lodash";

export function createMapSystem(layer: PhaserLayer) {
    const {
        networkLayer: {
            components: { MapConfig },
        },
        scenes: {
            Main: {
                maps: {
                    Main: { putTileAt },
                },
            },
        },
    } = layer;

    const mapConfig = getComponentValueStrict(MapConfig, singletonEntity);
    MAP_CONFIG.GAME_SEED = mapConfig.seed;
    MAP_CONFIG.WIDTH_TILE = mapConfig.widthTiles;
    MAP_CONFIG.HEIGHT_TILE = mapConfig.heightTiles;

    const rng = seedrandom(MAP_CONFIG.GAME_SEED);
    const noise = createNoise2D(rng);

    for (let x = 0; x < MAP_CONFIG.WIDTH_TILE; x++) {
        for (let y = 0; y < MAP_CONFIG.WIDTH_TILE; y++) {
            const coord = { x, y };
            const seed = noise(x, y);

            putTileAt(coord, Tileset.Space_1, "Background");
            if (seed > 0.5) {
                putTileAt(coord, random(0, 4), "Background");
            }
        }
    }
}
