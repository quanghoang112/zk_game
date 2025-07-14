import { PhaserLayer } from "../createPhaserLayer";
import { createPlayerSystem } from "./createPlayerSystem";
import { createDebugSystem } from "./createDebugSystem";
import { createUISystem } from "./createUISystem";
import { createMapSystem } from "./createMapSystem";
import { createPlanetSystem } from "./createPlanetSystem";
import { createOpponentSystem } from "./createOpponentSystem";

export const registerSystems = (layer: PhaserLayer) => {
    createMapSystem(layer);
    createPlanetSystem(layer);
    createDebugSystem(layer);
    createPlayerSystem(layer);
    createUISystem(layer);
    // createOpponentSystem(layer);
};
