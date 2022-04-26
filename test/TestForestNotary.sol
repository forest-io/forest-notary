// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "truffle/Assert.sol";
import "../contracts/ForestNotary.sol";

contract TestForestNotary {

    ForestNotary notary;
    bytes32 constant forestName = bytes32("kongo");

    function beforeEach() public {
        notary = new ForestNotary();
    }

    function testRegisterForest() public {
        Assert.equal(notary.forestsCount(), uint(0), "number of forests should be 0");
        notary.registerForest(forestName);
        Assert.equal(notary.forestsCount(), uint(1), "number of forests should be 1");
        (bytes32 name, uint createdAt, uint verificationsCount) = notary.getForestInfo(forestName);
        Assert.equal(name, forestName, "forest name does not match");
        Assert.equal(createdAt, block.timestamp, "forest createdAt should be current timestamp");
        Assert.equal(verificationsCount, 0, "forest verificationsCount should be 0");
    }

    function testRegisterForest_AlreadyRegistered() public {
        notary.registerForest(forestName);
        try notary.registerForest(forestName) {
            Assert.fail("method execution should fail");
        } catch Error(string memory reason) {
            Assert.equal(reason, "The forest is already registered", "failed with unexpected reason");
        }
    }

    function testRegisterForest_NotOwner() public {
        // TODO: seems that this can't be implemented in Ganache Test Suite
    }

    function testAddVerification() public {
        notary.registerForest(forestName);
        notary.addVerification(forestName, 123, 1649683497);
        (uint value, uint acquiredAt, uint createdAt) = notary.getVerificationInfo(forestName, 0);
        Assert.equal(value, 123, "value should be 123");
        Assert.equal(acquiredAt, 1649683497, "acquiredAt should be 1649683497");
        Assert.equal(createdAt, block.timestamp, "createdAt should be current timestamp");
    }

    function testGetVerificationInfo() public {
        notary.registerForest(forestName);
        notary.addVerification(forestName, 123, 1649683497);
        notary.addVerification(forestName, 124, 1649683498);
        (uint value, uint acquiredAt, uint createdAt) = notary.getVerificationInfo(forestName, 1);
        Assert.equal(value, 124, "value should be 124");
        Assert.equal(acquiredAt, 1649683498, "acquiredAt should be 1649683498");
        Assert.equal(createdAt, block.timestamp, "createdAt should be current timestamp");
    }

    function testGetVerificationInfo__UnregisteredForest() public {
        try notary.getVerificationInfo(forestName, 1) returns (uint, uint, uint) {
            Assert.fail("method execution should fail");
        } catch Error(string memory reason) {
            Assert.equal(reason, "The forest is not registered", "failed with unexpected reason");
        }
    }

    function testGetVerificationInfo__MissingVerification() public {
        notary.registerForest(forestName);
        try notary.getVerificationInfo(forestName, 1) returns (uint, uint, uint) {
            Assert.fail("method execution should fail");
        } catch Error(string memory reason) {
            Assert.equal(reason, "The forest verification does not exist", "failed with unexpected reason");
        }
    }
}
