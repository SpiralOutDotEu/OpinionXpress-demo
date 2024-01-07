// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OpinionXpress is Ownable {
    ISemaphore public semaphore;

    struct Group {
        bool isActive;
    }

    mapping(uint256 => Group) public groups;
    address public groupAdmin;
    address public voteAdmin;

    event GroupCreated(uint256 groupId);
    event GroupAdminChanged(address newAdmin);
    event VoteAdminChanged(address newAdmin);

    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
        groupAdmin = msg.sender;
        voteAdmin = msg.sender;
    }

    modifier onlyGroupAdmin() {
        require(msg.sender == groupAdmin, "Not group admin");
        _;
    }

    modifier onlyVoteAdmin() {
        require(msg.sender == voteAdmin, "Not vote admin");
        _;
    }

    function createGroup(uint256 groupId, uint256 depth) external onlyOwner {
        require(!groups[groupId].isActive, "Group already exists");
        groups[groupId].isActive = true;
        semaphore.createGroup(groupId, depth, address(this), 10 ^ 18 weeks);
        emit GroupCreated(groupId);
    }

    function changeGroupAdmin(address newAdmin) external onlyOwner {
        groupAdmin = newAdmin;
        emit GroupAdminChanged(newAdmin);
    }

    function changeVoteAdmin(address newAdmin) external onlyOwner {
        voteAdmin = newAdmin;
        emit VoteAdminChanged(newAdmin);
    }

    function addMember(uint256 groupId, uint256 identityCommitment) external onlyGroupAdmin {
        require(groups[groupId].isActive, "Group is not active");
        semaphore.addMember(groupId, identityCommitment);
    }

    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external onlyGroupAdmin {
        semaphore.updateMember(groupId, identityCommitment, newIdentityCommitment, proofSiblings, proofPathIndices);
    }

}
