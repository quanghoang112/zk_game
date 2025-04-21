import { getComponentValueStrict } from "@latticexyz/recs";
import { Tileset } from "../../../artTypes/spaces_debug";
import { PhaserLayer } from "../createPhaserLayer";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { createNoise2D } from "simplex-noise";
import seedrandom from "seedrandom";

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
    const rng = seedrandom(mapConfig.seed)
    const noise = createNoise2D(rng);

    for (let x = -500; x < 500; x++) {
        for (let y = -500; y < 500; y++) {
            const coord = { x, y };
            const seed = noise(x, y);

            putTileAt(coord, Tileset.Grass, "Background");

            if (seed >= 0.45) {
                putTileAt(coord, Tileset.Mountain, "Foreground");
            } else if (seed < -0.45) {
                putTileAt(coord, Tileset.Forest, "Foreground");
            }
        }
    }
}
