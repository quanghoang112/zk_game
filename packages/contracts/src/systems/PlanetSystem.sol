// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Planet, PlanetData, Position, PositionData, Stats, StatsData, OwnedBy,IsDead } from "../codegen/index.sol";
import { addressToEntity, manhattan } from "../Utils.sol";
// import {manhattan} from "../lib/Util.sol";

// event DebugUint(string label, uint256 value);


contract PlanetSystem is System {
    function _getPlanetID(address addr, uint8 salt) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(addr, salt));
    }

    function _isExisted(bytes32 id) internal view returns (bool) {
        PlanetData memory data = Planet.get(id);
        return (data.radius != 0 || data.power != 0);
    }

    function createPlanet(uint8 salt, uint32 x, uint32 y, uint32 radius, uint8 power) public {
        bytes32 id = _getPlanetID(_msgSender(), salt);
        require(!_isExisted(id));

        Planet.set(id, x, y, radius, power);
        OwnedBy.set(id, '1',25); // Initialize the planet's owner to empty
    }
    function PlanetAttack(uint32 x, uint32 y, uint32 radius, uint8 power,bytes32 _playerId) public {
        // bytes32 planetId = _getPlanetID(_msgSender(),salt);
        PositionData memory _posPlanet = PositionData(x, y);
        uint32 _distance = manhattan(
        Position.get(_playerId),
        _posPlanet
        );
        // emit DebugUint("distance: ", _distance);
        // require(_distance <= radius, "Opponent not in range");
        // implement the attack logic here


        // Decrease the player's health
        StatsData memory _PlayerStats = Stats.get(_playerId);
        
        // if (OwnedBy.getPlayerId(PlanetId))

        if(_distance <= radius)
            if (_PlayerStats.health > power) {
            Stats.setHealth(_playerId, _PlayerStats.health - power);
            }
            else {
            Stats.setHealth(_playerId, 0);
            Stats.setEnergy(_playerId,0); // Opponent is defeated
            // Position.deleteRecord(_playerId); // Remove opponent from the game
            IsDead.setIsDead(_playerId, true); // Set player as dead
            }
        // Stats.setEnergy(_playerId, _PlayerStats.energy - 5); // Decrease player's energy by 5
    }
}