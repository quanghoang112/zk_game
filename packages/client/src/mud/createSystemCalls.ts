// import { getComponentValue } from "@latticexyz/recs";
// import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
// import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Direction } from "../layers/phaser/constants";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { playerEntity, worldContract, waitForTransaction }: SetupNetworkResult
    // { Position, Stats }: ClientComponents,
) {
    const spawn = async (x: number, y: number) => {
        const tx = await worldContract.write.app__spawn([x, y]);
        await waitForTransaction(tx);
    };

    const move = async (dir: Direction) => {
        console.log("moving player: ", playerEntity);
        const tx = await worldContract.write.app__move([dir]);
        await waitForTransaction(tx);
    };

    return {
        spawn,
        move,
    };
}
