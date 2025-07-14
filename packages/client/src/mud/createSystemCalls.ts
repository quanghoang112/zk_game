// import { getComponentValue } from "@latticexyz/recs";
// import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
// import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Direction } from "../layers/phaser/constants";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { worldContract, waitForTransaction }: SetupNetworkResult
    // { Position, Stats }: ClientComponents,
) {
    const spawn = async (x: number, y: number) => {
        const tx = await worldContract.write.app__spawn([x, y]);
        await waitForTransaction(tx);
    };

    const death = async () => {
        const tx = await worldContract.write.app__death();
        await waitForTransaction(tx);
    };

    const move = async (dir: Direction) => {
        const tx = await worldContract.write.app__move([dir]);
        await waitForTransaction(tx);
    };

    const PlanetAttack = async (x: number, y: number,radius: number, power: number, playerId: string) => {
        const tx = await worldContract.write.app__PlanetAttack([x, y,radius, power, playerId as `0x${string}`]);
        await waitForTransaction(tx);
    };

    const PlayerAttack = async (planetId: string) => {
        const tx = await worldContract.write.app__PlayerAttack([planetId as `0x${string}`]);
        await waitForTransaction(tx);
    };

    return {
        spawn,
        death,
        move,
        PlanetAttack,
        PlayerAttack,
    };
}
