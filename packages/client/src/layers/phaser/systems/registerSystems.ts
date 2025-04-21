import { PhaserLayer } from "../createPhaserLayer";
import { createPlayerSystem } from "./createPlayerSystem";
import { createDebugSystem } from "./createDebugSystem";
import { createUISystem } from "./createUISystem";

export const registerSystems = (layer: PhaserLayer) => {
    createPlayerSystem(layer);
    createDebugSystem(layer);
    createUISystem(layer);
};
