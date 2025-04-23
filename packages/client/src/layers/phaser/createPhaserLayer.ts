import { createPhaserEngine } from "@latticexyz/phaserx";
import { namespaceWorld } from "@latticexyz/recs";
import { NetworkLayer } from "../network/createNetworkLayer";
import { registerSystems } from "./systems";
import { MAP_CONFIG, TILE_WIDTH, TILE_HEIGHT } from "./constants";

export type PhaserLayer = Awaited<ReturnType<typeof createPhaserLayer>>;
type PhaserEngineConfig = Parameters<typeof createPhaserEngine>[0];

export const createPhaserLayer = async (
    networkLayer: NetworkLayer,
    phaserConfig: PhaserEngineConfig
) => {
    const world = namespaceWorld(networkLayer.world, "phaser");

    const {
        game,
        scenes,
        dispose: disposePhaser,
    } = await createPhaserEngine(phaserConfig);
    world.registerDisposer(disposePhaser);

    const { camera } = scenes.Main;

    const components = {};

    interface ExtendedPlayer
        extends ReturnType<typeof scenes.Main.objectPool.get<"Sprite">> {
        x: number;
        y: number;
    }

    const custom = {
        methods: {
            initPlayer: () => {
                console.log("Default initPlayer()");
            },
            focusCameraOnEntity: (entity: string) => {
                console.log("Default focusCameraOnEntity(), entity: ", entity);
            },
        },
        player: undefined as ExtendedPlayer | undefined,
    };

    const layer = {
        networkLayer,
        world,
        game,
        scenes,
        components,
        custom,
    };

    registerSystems(layer);

    camera.phaserCamera.setBounds(
        0,
        0,
        MAP_CONFIG.WIDTH_TILE * TILE_WIDTH,
        MAP_CONFIG.HEIGHT_TILE * TILE_HEIGHT
    );

    return layer;
};
