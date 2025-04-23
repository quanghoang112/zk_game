// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Planet, PlanetData } from "../codegen/index.sol";
import { addressToEntity } from "../Utils.sol";

contract PlanetSystem is System {
    function _getPlanetID(address addr, uint8 salt) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(addr, salt));
    }

    function _isExisted(bytes32 id) internal view returns (bool) {
        PlanetData memory data = Planet.get(id);
        return (data.radius != 0 || data.power != 0);
    }

    function createPlanet(uint8 salt, uint8 radius, uint8 power) public {
        bytes32 id = _getPlanetID(_msgSender(), salt);
        require(!_isExisted(id));

        Planet.set(id, radius, power);
    }
}