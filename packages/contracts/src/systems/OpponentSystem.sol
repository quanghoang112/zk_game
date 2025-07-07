// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Opponent, OpponentData, MapConfigData, MapConfig } from "../codegen/index.sol";
import { addressToEntity } from "../Utils.sol";

contract OpponentSystem is System {
    function _isValidPosition(uint32 x, uint32 y) internal view returns (bool) {
    MapConfigData memory mapConf = MapConfig.get();
    return x >= 0 && x < mapConf.widthTiles && y >= 0 && y < mapConf.heightTiles;
    }

    function _getOpponentID(address addr, uint8 salt) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(addr, salt));
    }

    function _isExisted(bytes32 id) internal view returns (bool) {
        OpponentData memory data = Opponent.get(id);
        return (_isValidPosition(data.x, data.y));
    }

    function createOpponent(uint8 salt, uint32 x, uint32 y) public {
        bytes32 id = _getOpponentID(_msgSender(), salt);
        // require(!_isExisted(id));

        Opponent.set(id, x, y);
    }
}