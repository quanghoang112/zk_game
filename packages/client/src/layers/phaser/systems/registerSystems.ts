import { PhaserLayer } from "../createPhaserLayer";
import { createPlayerSystem } from "./createPlayerSystem";
import { createDebugSystem } from "./createDebugSystem";
import { createUISystem } from "./createUISystem";
import { createMapSystem } from "./createMapSystem";

export const registerSystems = (layer: PhaserLayer) => {
    createMapSystem(layer);
    createDebugSystem(layer);
    createPlayerSystem(layer);
    createUISystem(layer);
};
