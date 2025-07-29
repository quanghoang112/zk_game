// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionData, Stats, StatsData, OwnedBy, ZKState } from "../codegen/index.sol";
// import {manhattan} from "../lib/Util.sol";
import { Direction } from "../codegen/common.sol";
import { addressToEntity,addressToEntityKey } from "../Utils.sol";
import { EncodedLengths, EncodedLengthsLib } from "@latticexyz/store/src/EncodedLengths.sol";


interface ICircomVerifier {
    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals) external view returns (bool);
}

contract PlayerActionSystem is System {
    function Conqueror(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals,bytes32 planetId, bytes32 attacker) public
    {
        // ICircomVerifier(ZKState.getCircomVerifier()).verifyProof(_pA, _pB, _pC, _pubSignals);
        ICircomVerifier(ZKState.getCircomVerifier()).verifyProof(
            _pA, _pB, _pC, _pubSignals
        );
        uint32 commitment = uint32(_pubSignals[0]);
        uint32 result = uint32(_pubSignals[1]);
        // bytes32 attacker = addressToEntity(_msgSender());
        // require(OwnedBy.getPlayerId(planetId) == deffender, "Planet is not owned by defender");
        require(result==1, "Attacker win the battle");

        uint32 EnergyCommitment = ZKState.getCommitment();
        // require(uint32(uint(commitment)) == EnergyCommitment, "Invalid commitment");
        uint32 value = OwnedBy.getValue(planetId);

        OwnedBy.set(planetId, attacker,value+10); // Set the planet's owner to the attacker
        // OwnedBy.setValue(planetId, 25);

    }
    function PlayerAttack(bytes32 planetId) public {
        bytes32 playerId = addressToEntity(_msgSender());
        uint32 value = 25;

        PositionData memory player = Position.get(playerId);
        StatsData memory stats = Stats.get(playerId);
        require(OwnedBy.getPlayerId(planetId) == '', "This planet is already owned by someone");
        require(stats.energy > value, "not enough energy to attack");
        Stats.setEnergy(playerId, stats.energy - 5); // Decrease player's energy by 5
        uint256 rand = uint256(
            keccak256(
                abi.encode(player, player.x, player.y, blockhash(block.number - 1), block.prevrandao)
            )
        );
        OwnedBy.set(planetId, playerId,value);
        // OwnedBy.setValue(planetId, value);
        // if (OwnedBy.getPlayerId(planetId) == '')// No one owns the planet
        // {
        //     OwnedBy.setPlayerId(planetId, playerId);
        //     // Stats.set(planetId, 0, 0); // Initialize planet stats
        // }
        // else if (OwnedBy.getPlayerId(planetId) == playerId)// Player already owns the planet
        // {
        //     // Do nothing, player already owns the planet
        // }
        // else if (rand % 2 == 1)// Player wins the battle
        // {
        //     OwnedBy.setPlayerId(planetId, playerId);
        //     OwnedBy.setValue(planetId, value); // Reset the value of the planet
        //     // Stats.setEnergy(playerId, stats.energy - 20); // Decrease player's energy by 20
        // }
        // else//player lose
        // {
        //     Stats.setEnergy(playerId, stats.energy - 20); // Decrease player's energy by 5
        // }
    }
}
