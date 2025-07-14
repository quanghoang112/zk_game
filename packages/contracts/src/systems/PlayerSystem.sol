// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionData, Stats, StatsData, MapConfig, MapConfigData } from "../codegen/index.sol";
// import {manhattan} from "../lib/Util.sol";
import { Direction } from "../codegen/common.sol";
import { addressToEntity } from "../Utils.sol";

contract PlayerSystem is System {
  // `_isValidPosition` returns true if {x, y} is inside of the map
  function _isValidPosition(uint32 x, uint32 y) internal view returns (bool) {
    MapConfigData memory mapConf = MapConfig.get();
    return x >= 0 && x < mapConf.widthTiles && y >= 0 && y < mapConf.heightTiles;
  }

  // `spawn` initializes a new player in the game by storing his position in the blockchain
  function spawn(uint32 x, uint32 y) public {
    // Ensure the spawn position is valid
    require(_isValidPosition(x, y));

    // Check if the player exists
    bytes32 _id = addressToEntity(_msgSender());
    PositionData memory posData = Position.get(_id);

    // If the player doesn't exist
    if (posData.x == 0 && posData.y == 0) {
      Position.set(_id, x, y);
      Stats.set(_id, 100, 100); // 0 health, 100 energy --> move 100 steps
    }
  }

  function death() public {
    // Ensure the spawn position is valid
    // require(_isValidPosition(x, y));

    // Check if the player exists
    bytes32 _id = addressToEntity(_msgSender());
    // PositionData memory posData = Position.get(_id);
    StatsData memory sData= Stats.get(_id);
    if(sData.health == 0) {
      // If the player doesn't exist
      Position.deleteRecord(_id);
      Stats.deleteRecord(_id);
    }
  }

  // `move` updates the player's position based on the direction, if the move is valid.
  function move(Direction moveDir) public {
    bytes32 _id = addressToEntity(_msgSender());

    // Check if the player has enough energy
    uint32 _energy = Stats.getEnergy(_id);
    if (_energy < 1) return;

    PositionData memory _pos = Position.get(_id);
    // TODO: Verify that there are no obstacle

    PositionData memory _new_pos = _pos;
    if (moveDir == Direction.Up) _new_pos.y++;
    else if (moveDir == Direction.Right) _new_pos.x++;
    else if (moveDir == Direction.Down) _new_pos.y--;
    else if (moveDir == Direction.Left) _new_pos.x--;

    // Prevent the player to move outside the map
    MapConfigData memory mapConf = MapConfig.get();
    if (
      (_new_pos.x < 0 || uint32(_new_pos.x) >= mapConf.widthTiles) ||
      (_new_pos.y < 0 || uint32(_new_pos.y) >= mapConf.heightTiles)
    ) return;

    // Moving
    Stats.setEnergy(_id, _energy - 1);
    Position.set(_id, _new_pos.x, _new_pos.y);
  }

  // function attack(bytes32 _opponentId) public {
  //   bytes32 _playerId = addressToEntity(_msgSender());
  //   require(!(_playerId== _opponentId), "Cannot attack yourself");
  //   require(Stats.getEnergy(_playerId) >= 5, "Not enough energy to attack");
  //   uint32 _distance = manhattan(
  //     Position.get(_playerId),
  //     Position.get(_opponentId)
  //   );
  //   require(_distance <= 50, "Opponent not in range");
  //   // implement the attack logic here


  //   // Decrease the player's health
  //   StatsData memory _OpponentStats = Stats.get(_opponentId);
  //   StatsData memory _PlayerStats = Stats.get(_playerId);
  //   if (_OpponentStats.health > 5) {
  //     Stats.setHealth(_opponentId, _OpponentStats.health - 5);
  //   }
  //   else {
  //     Stats.setHealth(_opponentId, 0);
  //     Stats.setEnergy(_opponentId,0); // Opponent is defeated
  //     Position.deleteRecord(_opponentId); // Remove opponent from the game
  //   }
  //   Stats.setEnergy(_playerId, _PlayerStats.energy - 5); // Decrease player's energy by 5

  //   // Check if the opponent is in the same position
  // }
}
