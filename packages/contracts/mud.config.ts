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
        radius: "uint8",
        power: "uint8",
      },
      key: ["id"],
    },
  },
});
