// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { MapConfig } from "../codegen/index.sol";

contract MapConfigSystem is System {
  function createMapConfig(uint32 width, uint32 height, bytes32 seed) public {
    MapConfig.set(width, height, seed);
  }
}
