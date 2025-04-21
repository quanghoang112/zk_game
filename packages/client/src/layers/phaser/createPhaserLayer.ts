import { createPhaserEngine } from "@latticexyz/phaserx";
import { Entity, namespaceWorld } from "@latticexyz/recs";
import { NetworkLayer } from "../network/createNetworkLayer";
import { registerSystems } from "./systems";

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

    camera.phaserCamera.setBounds(0, 0, 3000, 3000);

    const components = {};

    interface ExtendedPlayer extends ReturnType<typeof scenes.Main.objectPool.get<"Sprite">> {
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
        player: scenes.Main.objectPool.get("0xC0FFE" as Entity, "Sprite") as ExtendedPlayer,
    };
    custom.player.despawn();

    const layer = {
        networkLayer,
        world,
        game,
        scenes,
        components,
        custom,
    };

    registerSystems(layer);

    return layer;
};
