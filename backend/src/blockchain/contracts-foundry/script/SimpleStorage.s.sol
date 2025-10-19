// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract SimpleStorageScript is Script {
    function run() public {
        vm.startBroadcast();

        SimpleStorage simpleStorage = new SimpleStorage();
        
        // Optional: set an initial value
        simpleStorage.setValue(42);
        
        console.log("SimpleStorage deployed at:", address(simpleStorage));
        console.log("Initial value set to:", simpleStorage.getValue());

        vm.stopBroadcast();
    }
}
