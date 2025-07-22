// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionData, Stats, StatsData, OwnedBy, ZKState } from "../codegen/index.sol";
// import {manhattan} from "../lib/Util.sol";
import { Direction } from "../codegen/common.sol";
import { addressToEntity,addressToEntityKey } from "../Utils.sol";
import { EncodedLengths, EncodedLengthsLib } from "@latticexyz/store/src/EncodedLengths.sol";



contract VerifierSystem is System
{
    function createZKState(uint32 commitment, address circomVerifier) public {
        ZKState.set(commitment, circomVerifier);
    }
}