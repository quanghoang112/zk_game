import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "app",
  enums: {
    Direction: ["Unknown", "Up", "Right", "Down", "Left"],
  },
  tables: {
    Position: {
      schema: {
        id: "bytes32",
        x: "uint32",
        y: "uint32",
      },
      key: ["id"],
    },
    IsDead: {
      schema: {
        id: "bytes32",
        isDead: "bool",
      },
      key: ["id"],
    },
    OwnedBy: {
      schema: {
        PlanetId: "bytes32",
        PlayerId: "bytes32",
        Value: "uint32",
      },
      key: ["PlanetId"],
    },
    Stats: {
      schema: {
        id: "bytes32",
        health: "uint16",
        energy: "uint32",
      },
      key: ["id"],
    },
    MapConfig: {
      schema: {
        widthTiles: "uint8",
        heightTiles: "uint8",
        seed: "bytes32",
      },
      key: [],
    },
    Planet: {
      schema: {
        id: "bytes32",
        x: "uint32",
        y: "uint32",
        radius: "uint32",
        power: "uint8",
      },
      key: ["id"],
    },
    Opponent: {
      schema: {
        id: "bytes32",
        x: "uint32",
        y: "uint32",
      },
      key: ["id"],
    },
    ZKState: {
      schema: {
        Commitment: "uint32",
        circomVerifier: "address",
      },
      key: [],
    },
  },
});
