// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

function addressToEntity(address _addr) pure returns (bytes32) {
  return keccak256(abi.encodePacked(_addr));
}
