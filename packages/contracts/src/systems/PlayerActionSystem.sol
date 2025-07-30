// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionData, Stats, StatsData, OwnedBy, ZKState } from "../codegen/index.sol";
// import {manhattan} from "../lib/Util.sol";
import { Direction } from "../codegen/common.sol";
import { addressToEntity,addressToEntityKey } from "../Utils.sol";
import { EncodedLengths, EncodedLengthsLib } from "@latticexyz/store/src/EncodedLengths.sol";


interface ICircomVerifier {
    function verifyProof_Conquer(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals) external view returns (bool);
    function verifyProof_HitPlayer(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[4] calldata _pubSignals) external view returns (bool);
}

// interface ICircomVerifier
// {
//     function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[4] calldata _pubSignals) external view returns (bool);
// }

contract PlayerActionSystem is System {
    function Conqueror(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals,bytes32 planetId, bytes32 attacker) public
    {
        // ICircomVerifier(ZKState.getCircomVerifier()).verifyProof(_pA, _pB, _pC, _pubSignals);
        ICircomVerifier(ZKState.getCircomVerifier()).verifyProof_Conquer(
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
    }

    function AttackPlayer(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[4] calldata _pubSignals, bytes32 playerId) public
    {
        ICircomVerifier(ZKState.getCircomVerifier()).verifyProof_HitPlayer(
            _pA, _pB, _pC, _pubSignals
        );
        uint32 commitment = uint32(_pubSignals[0]);
        uint32 result = uint32(_pubSignals[1]);
        uint32 attackX=uint32(_pubSignals[2]);
        uint32 attackY=uint32(_pubSignals[3]);
        // bytes32 playerId = addressToEntity(_msgSender());
        StatsData memory statsPlayer = Stats.get(playerId);

        uint32 hitCommitment = ZKState.getCommitment();
        // require(uint32(uint(commitment)) == hitCommitment, "Invalid commitment");
        require((statsPlayer.energy >= 5),"Not enough energy to attack!");
        if(result==0)
            Stats.set(playerId, statsPlayer.health, statsPlayer.energy-5);
        else
            Stats.set(playerId, statsPlayer.health, statsPlayer.energy+40);
    }
    function BeHitted(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[4] calldata _pubSignals, bytes32 beHitted) public
    {
        ICircomVerifier(ZKState.getCircomVerifier()).verifyProof_HitPlayer(
            _pA, _pB, _pC, _pubSignals
        );
        uint32 commitment = uint32(_pubSignals[0]);
        uint32 result = uint32(_pubSignals[1]);
        uint32 attackX=uint32(_pubSignals[2]);
        uint32 attackY=uint32(_pubSignals[3]);
        uint32 hitCommitment = ZKState.getCommitment();
        // require(uint32(uint(commitment)) == hitCommitment, "Invalid commitment");
        require(result==1,"They hit the void!");

        StatsData memory statsHitted = Stats.get(beHitted);

        if(statsHitted.health <15) Stats.set(beHitted, 0,statsHitted.energy);
        else
            Stats.set(beHitted, statsHitted.health-15,statsHitted.energy);

    }

}
