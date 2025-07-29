pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";
include "../circomlib/circuits/comparators.circom";

template commitmentHasher() {
    signal input player_x;
    signal input player_y;
    signal output commitment;

    component poseidonComponent = Poseidon(2);
    poseidonComponent.inputs[0] <== player_x;
    poseidonComponent.inputs[1] <== player_y;
    commitment <== poseidonComponent.out;
}

template hitPlayer()
{
    signal input player_x;
    signal input player_y;
    signal input attack_x;
    signal input attack_y;

    signal output commitment;
    signal output result;

    component commitmentHasherComponent =commitmentHasher();
    commitmentHasherComponent.player_x <== player_x;
    commitmentHasherComponent.player_y <== player_y;
    commitment <== commitmentHasherComponent.commitment;

    signal check_x;
    signal check_y;

    check_x <== player_x-attack_x;
    check_y <== player_y-attack_y;

    component isHit_x = IsZero();
    component isHit_y = IsZero();
    isHit_x.in <== check_x;
    isHit_y.in <== check_y;

    result <== isHit_x.out * isHit_y.out;
    
    log(result);
    log(commitment);
}

component main {public [attack_x,attack_y]} = hitPlayer();