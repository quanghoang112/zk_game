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
        x: "int32",
        y: "int32",
      },
      key: ["id"],
    },
    Stats: {
      schema: {
        id: "bytes32",
        health: "uint32",
        energy: "uint32",
      },
      key: ["id"],
    },
    MapConfig: {
      schema: {
        widthTiles: "uint32",
        heightTiles: "uint32",
        seed: "bytes32",
      },
      key: [],
    }
  },
});
