// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    // Config map
    bytes32 rdSeed = keccak256(abi.encodePacked("random seed"));
    IWorld(worldAddress).app__createMapConfig(32, 32, rdSeed);

    // Create a default planet called "The Void"
    uint8 salt = 0;
    uint8 radius = 5;
    uint8 power = 10;
    IWorld(worldAddress).app__createPlanet(salt, radius, power);

    // Stop broadcasting transactions from the deployer account
    vm.stopBroadcast();
  }
}
