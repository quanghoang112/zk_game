pragma solidity >=0.8.24;

import { Position, PositionData, Stats, StatsData, MapConfig, MapConfigData } from "../codegen/index.sol";


function manhattan(PositionData memory a, PositionData memory b) pure returns (uint32) {
  uint32 dx = a.x > b.x ? a.x - b.x : b.x - a.x;
  uint32 dy = a.y > b.y ? a.y - b.y : b.y - a.y;
  return dx + dy;
}