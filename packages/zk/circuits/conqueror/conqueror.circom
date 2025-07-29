pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template commitmentHasher() {
    signal input coin_Attacker;
    signal input coin_Defender;
    signal output commitment;
    component poseidonComponent;
    poseidonComponent = Poseidon(2);
    poseidonComponent.inputs[0] <== coin_Attacker;
    poseidonComponent.inputs[1] <== coin_Defender;
    commitment <== poseidonComponent.out;
}

template Conqueror()
{
  signal input coin_Attacker;
  signal input coin_Defender;
  signal output commitment;
  signal output result;


  // create commitment
  component hasher = commitmentHasher();
  hasher.coin_Attacker <== coin_Attacker;
  hasher.coin_Defender <== coin_Defender;
  commitment <== hasher.commitment;

  // compare the two coins
  component comparator = GreaterThan(32);
  comparator.in[0] <== coin_Attacker;
  comparator.in[1] <== coin_Defender;
  result <== comparator.out;

  log(result);
  log(commitment);
}

component main = Conqueror();