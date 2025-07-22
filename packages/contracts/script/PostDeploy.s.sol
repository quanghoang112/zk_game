// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { ZKState } from "../src/codegen/index.sol";
import { Groth16Verifier } from "../src/CircomVerifier.sol";
// import{addressToEntity} from"../src/Utils.sol";

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
    uint32 radius = 500;
    uint8 power = 10;
    IWorld(worldAddress).app__createPlanet(salt, 5, 5, radius, power);

    // Create a opponent
    IWorld(worldAddress).app__createOpponent(salt, 7, 7);

    // Deploy commitment on-chain so he can't change it later
    uint32 Commitment = uint32(uint(4561887125970913112567872782541489075583363854823519272033252705402213231374));
    address circomVerifier = address(new Groth16Verifier());
    IWorld(worldAddress).app__createZKState(Commitment, circomVerifier);
    // ZKState.set(Commitment, circomVerifier);
    // ZKState.setCircomVerifier(circomVerifier);
    // ZKState.setCommitment(Commitment);
    // 0x746261707000000000000000000000005a4b5374617465000000000000000000 ZKStateTableId



    // Stop broadcasting transactions from the deployer account
    vm.stopBroadcast();
  }
}
