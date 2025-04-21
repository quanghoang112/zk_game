// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionData, Stats, StatsData } from "../codegen/index.sol";
import { Direction } from "../codegen/common.sol";
import { addressToEntity } from "../Utils.sol";
import { console } from "forge-std/console.sol";

contract PlayerSystem is System {
  function spawn(int32 x, int32 y) public {
    // Prevent to spawn at {0, 0}
    if (x == 0 && y == 0) return;

    bytes32 _id = addressToEntity(_msgSender());

    PositionData memory posData = Position.get(_id);

    // If the player doesn't exist
    if (posData.x == 0 && posData.y == 0) {
      Position.set(_id, x, y);
      Stats.set(_id, 0, 100); // 0 health, 100 energy --> move 100 steps
    }
  }

  // Move only 1 step at a time
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

    // Avoid {0, 0} position
    if (_new_pos.x == 0 && _new_pos.y == 0) return;

    // Moving
    Stats.setEnergy(_id, _energy - 1);
    Position.set(_id, _new_pos.x, _new_pos.y);
  }
}
