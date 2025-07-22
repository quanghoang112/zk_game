const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const snarkjs = require('snarkjs');
const { get } = require('http');

const contractAddressWorld = "0xfDf868Ea710FfD8cd33b829c5AFf79eDd15EcD5f";
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const playerTableId = "0x74626170700000000000000000000000506f736974696f6e0000000000000000";
const PlanetId ="0x74626170700000000000000000000000506c616e657400000000000000000000";
const Stats="0x7462617070000000000000000000000053746174730000000000000000000000";
const OwnedBy="0x746261707000000000000000000000004f776e65644279000000000000000000";

// const Energy = JSON.parse(fs.readFileSync('conqueror.json', 'utf-8'));

const app = express();
const PORT = 8080;

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const contractABI = [
    "function Conqueror(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals,bytes32 planetId, bytes32 attacker)",
];

const contractABIWorld = [
    "event Store_SetRecord(bytes32 indexed tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData)",
    "function app__Conqueror(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals,bytes32 planetId, bytes32 attacker)"
];
// function Conqueror(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals,bytes32 planetId, bytes32 attacker)
// Conqueror(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals, bytes32 planetId, bytes32 attacker)
const wallet = new ethers.Wallet(privateKey, provider);
const contractWorld = new ethers.Contract(contractAddressWorld, contractABIWorld, wallet);

//decode information from hex string
function decodeStats(hexString) {
    if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
    }
    const HealthHex = hexString.slice(0, 4);
    const EnergyHex = hexString.slice(4, 12);
    // const isDeadHex = hexString.slice(16, 18);
    const Health = parseInt(HealthHex, 16) | 0;
    const Energy = parseInt(EnergyHex, 16) | 0;
    // const isDead = parseInt(isDeadHex, 16) != 0;
    return { Health, Energy };
}

function decodeRecord(hexString) {
    if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
    }
    const xHex = hexString.slice(0, 8);
    const yHex = hexString.slice(8, 16);
    const isDeadHex = hexString.slice(16, 18);
    const x = parseInt(xHex, 16) | 0;
    const y = parseInt(yHex, 16) | 0;
    // const isDead = parseInt(isDeadHex, 16) != 0;
    return { x, y };
}

function decodeOwnedBy(hexString) {
    if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
    }
    const playerIdHex = hexString.slice(0, 64); // 32 bytes for playerId
    const valueHex = hexString.slice(64, 72); // 8 bytes for value
    const valueInt = parseInt(valueHex, 16) | 0;
    return {playerIdHex, valueInt};
}

//Create Cache for OwnedBy table
const OwnedByCache = new Map(); //

contractWorld.on("Store_SetRecord", async (tableId, keyTuple, staticData, encodedLengths, dynamicData) => {
    if (tableId === OwnedBy) {
        let decodedOwnedByData = decodeOwnedBy(staticData);
        // let playerId = '0x' + keyTuple[0].replace(/^0x000000000000000000000000/, '');
        let planetId=keyTuple[0];
        console.log(`Planet: ${planetId}, PlayerId: ${decodedOwnedByData.playerIdHex}, Value: ${decodedOwnedByData.valueInt}`);
        OwnedByCache.set(planetId, { playerId: decodedOwnedByData.playerIdHex, value: decodedOwnedByData.valueInt });
        console.log(`planetData cache ${planetId}:`, OwnedByCache.get(planetId));
  }
});









const cors = require("cors");
app.use(cors());


app.use(express.json());
// app.use(require("cors")());

// app.post("/", (req, res) => {
//   console.log("Received message:", req.body.message);
//   res.send("Received!");
// });

app.post("/", async (req, res) => {
  console.log("🔥 Đã nhận request POST /", req.body);
  // res.send('Server is receiving requests');
  const { attacker, x, y, energy, planetId } = req.body;
  console.log("player:", attacker, "x:", x, "y:", y, "energy:", energy, "planetId:", planetId);

  if (!attacker || x == null || y == null || energy == null || !planetId) {
    return res.status(400).send("Missing fields");
  }

  try {
    // 🔍 Gọi prover
    let ownerData = OwnedByCache.get(planetId);
    let energy_owner = ownerData ? ownerData.value : 0;
    console.log(`Energy of owner: ${energy_owner}`);
    console.log("energy:", energy_owner, typeof energy_owner);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        coin_Attacker: 75, //Need to be replaced with actual energy of attacker
        coin_Defender: 60, //Need to be replaced with actual energy of defender
      },
      "./zk_artifacts/conqueror.wasm",
      "./zk_artifacts/conqueror_final.zkey"
    );

    // 🎯 Định dạng proof
    console.log("Proof generated successfully");
    let pA = proof.pi_a; pA.pop();
    let pB = proof.pi_b; pB.pop();
    let pC = proof.pi_c; pC.pop();
    console.log("Run ZK successfully");
    // 🧨 Nếu tấn công thành công
    if (publicSignals[1] === "1") {
        console.log("publicSignals:", publicSignals);
        const tx = await contractWorld.app__Conqueror(pA, pB, pC, publicSignals, planetId, attacker);
        console.log("✅ TX sent:", tx.hash);
    }
    console.log("Proof and transaction processed successfully");
    res.send("Proof generated");
  } catch (err) {
        console.error("❌ Error during proof:", err);
        res.status(500).send("Proof failed");
  }
});


app.get('/', (req, res) => {
    // console.log("Received attack request:");
    // const { player, x, y, energy, planetId } = req.body;
    // console.log("player:", player, "x:", x, "y:", y, "energy:", energy, "planetId:", planetId);
    res.send('Server is running');
});

app.listen(PORT, async () => {
    console.log(`Server is listening on port ${PORT}`);
});