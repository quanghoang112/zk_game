import { PhaserLayer } from "../createPhaserLayer";
import { createPlayerSystem } from "./createPlayerSystem";
import { createDebugSystem } from "./createDebugSystem";
// import { createMapSystem } from "./createMapSystem";

// import { createTestSystem } from "./createTestSystem";

export const registerSystems = (layer: PhaserLayer) => {
    // createMapSystem(layer);
    createPlayerSystem(layer);
    createDebugSystem(layer);

    // createTestSystem(layer);
};
