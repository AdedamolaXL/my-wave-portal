// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
  uint256 totalWaves;

  //generate a random number
  uint256 private seed;
  
  event NewWave(address indexed from, uint256 timestamp, string message);

  // a struct to hold custom data
  struct Wave {
    address waver;  // address waver
    string message; // message the user sent
    uint256 timestamp; // the timestamp when the user waved.
  }

  /*
  * declaring a variable waves lets us store an array of structs
  * this variable holds all the waves anyone sensds to us
  */
  Wave[] waves;

  //address => uint mapping, storing the address with the last time a user waved at us
  mapping(address => uint256) public lastWavedAt;

  constructor() payable {
    console.log("I am a smart contract baby!");

    //set the initial seed
    seed = (block.timestamp + block.difficulty) % 100;
  }

  function wave(string memory _message) public {

    //make the current timestamp at least 15mins bigger than the last
    require(
      lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
      "Wait 30s before waving again"
    );

    //update the curent timestamp we have for the user
    lastWavedAt[msg.sender] = block.timestamp;

    totalWaves +=1;
    console.log("%s has waved", msg.sender, _message);

    // the actual wave data is stored in this array
    waves.push(Wave(msg.sender, _message, block.timestamp));

    //generate a new seed for the next user that sends a wave

    seed = (block.difficulty + block.timestamp + seed) % 100;

    console.log("Random # generated: %d", seed);

    //give a 50% chanc that the user wins the prize.

    if (seed <= 50) {
      console.log("%s won!", msg.sender);

      uint256 prizeAmount = 0.0001 ether;
    require(
      prizeAmount <= address(this).balance,
      "Trying to withdraw more money than the contract has."
    );
    (bool success, ) = (msg.sender).call{value: prizeAmount}("");
    require(success, "Failed to withdraw money from contract.");
    }

    emit NewWave(msg.sender, block.timestamp, _message);

    
  }

  function getAllWaves() public view returns (Wave[] memory) {
    return waves;
  }

  function getTotalWaves() public view returns (uint256) {
    
    // allowa you to see the contract print the value!
    console.log("We have %d total waves!", totalWaves);
    return totalWaves;
  }
}



