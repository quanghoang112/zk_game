// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Position, PositionData, Stats, StatsData, MapConfig, MapConfigData } from "./codegen/index.sol";

function addressToEntity(address _addr) pure returns (bytes32) {
  return keccak256(abi.encodePacked(_addr));
}

function addressToEntityKey(address _addr) pure returns (bytes32) {
  return bytes32(uint256(uint160(_addr)));
}

function positionToEntityKey(int32 x, int32 y) pure returns (bytes32) {
  return keccak256(abi.encode(x, y));
}

function manhattan(PositionData memory a, PositionData memory b) pure returns (uint32) {
  uint32 dx = a.x > b.x ? a.x - b.x : b.x - a.x;
  uint32 dy = a.y > b.y ? a.y - b.y : b.y - a.y;
  return dx + dy;
}