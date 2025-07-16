// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionData, Stats, StatsData, OwnedBy } from "../codegen/index.sol";
// import {manhattan} from "../lib/Util.sol";
import { Direction } from "../codegen/common.sol";
import { addressToEntity,addressToEntityKey } from "../Utils.sol";

contract PlayerActionSystem is System {
    function PlayerAttack(bytes32 planetId) public {
        bytes32 playerId = addressToEntity(_msgSender());

        PositionData memory player = Position.get(playerId);
        StatsData memory stats = Stats.get(playerId);
        require(stats.energy > 25, "not enough energy to attack");
        Stats.setEnergy(playerId, stats.energy - 5); // Decrease player's energy by 5
        uint256 rand = uint256(
            keccak256(
                abi.encode(player, player.x, player.y, blockhash(block.number - 1), block.prevrandao)
            )
        );
        if (OwnedBy.getPlayerId(planetId) == '')// No one owns the planet
        {
            OwnedBy.setPlayerId(planetId, playerId);
            // Stats.set(planetId, 0, 0); // Initialize planet stats
        }
        else if (OwnedBy.getPlayerId(planetId) == playerId)// Player already owns the planet
        {
            // Do nothing, player already owns the planet
        }
        else if (rand % 2 == 1)// Player wins the battle
        {
            OwnedBy.setPlayerId(planetId, playerId);
            // Stats.setEnergy(playerId, stats.energy - 20); // Decrease player's energy by 20
        }
        else//player lose
        {
            Stats.setEnergy(playerId, stats.energy - 20); // Decrease player's energy by 5
        }
    }
}
