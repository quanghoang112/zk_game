import { Entity } from "@latticexyz/recs";
import { keccak256, encodePacked } from "viem";
import { PhaserLayer } from "./createPhaserLayer";

export const isThePlayer = (entity: Entity, layer: PhaserLayer): boolean => {
    return (
        entity ===
        keccak256(
            encodePacked(
                ["address"],
                [layer.networkLayer.network.walletClient.account.address]
            )
        )
    );
};
