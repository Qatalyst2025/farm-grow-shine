// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CropManager {
    // Crop State
    string public cropId;
    uint256 public growthProgress;
    string public currentStage;
    string public cropHealth;

    // Events for Mirror Node listeners
    event CropUpdated(
        string cropId,
        uint256 progress,
        string stage,
        string health,
        uint256 timestamp
    );

    constructor(string memory _cropId) {
        cropId = _cropId;
        growthProgress = 0;
        currentStage = "Planted";
        cropHealth = "Healthy";
    }

    function updateCropState(
        uint256 _progress,
        string memory _stage,
        string memory _health
    ) public {
        growthProgress = _progress;
        currentStage = _stage;
        cropHealth = _health;

        emit CropUpdated(
            cropId,
            _progress,
            _stage,
            _health,
            block.timestamp
        );
    }

    function getCropState()
        public
        view
        returns (
            string memory,
            uint256,
            string memory,
            string memory
        )
    {
        return (cropId, growthProgress, currentStage, cropHealth);
    }
}

