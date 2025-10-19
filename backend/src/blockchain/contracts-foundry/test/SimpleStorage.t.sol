// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public simpleStorage;

    function setUp() public {
        simpleStorage = new SimpleStorage();
    }

    function test_SetValue() public {
        uint256 testValue = 42;
        simpleStorage.setValue(testValue);
        assertEq(simpleStorage.getValue(), testValue);
    }

    function test_InitialValue() public view { // Added 'view' modifier
        // Test that initial value is 0 (default for uint256)
        assertEq(simpleStorage.getValue(), 0);
    }

    function test_EmitValueChanged() public {
        uint256 testValue = 100;
        
        // Expect the ValueChanged event to be emitted with the correct parameter
        vm.expectEmit(true, true, true, true, address(simpleStorage));
        emit SimpleStorage.ValueChanged(testValue);
        
        simpleStorage.setValue(testValue);
    }

    function testFuzz_SetValue(uint256 x) public {
        simpleStorage.setValue(x);
        assertEq(simpleStorage.getValue(), x);
    }

    function test_UpdateValue() public {
        // Test multiple value changes
        simpleStorage.setValue(10);
        assertEq(simpleStorage.getValue(), 10);
        
        simpleStorage.setValue(999);
        assertEq(simpleStorage.getValue(), 999);
        
        simpleStorage.setValue(0);
        assertEq(simpleStorage.getValue(), 0);
    }

    function test_EventEmission() public {
        // Alternative way to test events
        uint256 testValue = 123;
        
        vm.expectEmit(true, true, true, true);
        emit SimpleStorage.ValueChanged(testValue);
        
        simpleStorage.setValue(testValue);
    }
}
