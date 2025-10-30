// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedValue;

    event ValueChanged(uint256 newValue);

    function setValue(uint256 _value) public {
        storedValue = _value;
        emit ValueChanged(_value);
    }

    function getValue() public view returns (uint256) {
        return storedValue;
    }
    
    function updateGrowth(uint progress, string memory stage, string memory health) public {
      growthProgress = progress;
      currentStage = stage;
      cropHealth = health;
      emit GrowthUpdated(progress, stage, health, block.timestamp);
    }

}
