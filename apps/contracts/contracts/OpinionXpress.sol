// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "@semaphore-protocol/contracts/interfaces/ISemaphoreVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Survey.sol";

contract OpinionXpress is Ownable, Survey {
    ISemaphore public semaphore;
    ISemaphoreVerifier public verifier;

    enum PollState {
        Created,
        Ongoing,
        Ended
    }

    struct Group {
        bool isActive;
        uint256 depth;
    }

    struct Poll {
        PollState state;
        uint32 yesCounter;
        uint32 noCounter;
        string text;
        mapping(uint256 => bool) nullifierHashes;
        mapping(uint256 => bool) groupsAllowed;
    }

    mapping(uint256 => Poll) public polls;
    mapping(uint256 => Group) public groups;
    address public groupAdmin;
    address public voteAdmin;

    event GroupCreated(uint256 groupId, uint256 depth);
    event GroupAdminChanged(address newAdmin);
    event VoteAdminChanged(address newAdmin);
    event PollCreated(uint256 pollId, string text);
    event VoteCasted(uint256 pollId, uint256 vote);

    constructor(address semaphoreAddress, address verifierAddress) {
        semaphore = ISemaphore(semaphoreAddress);
        verifier = ISemaphoreVerifier(verifierAddress);
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
        groups[groupId].depth = depth;
        semaphore.createGroup(groupId, depth, address(this), 10 ^ 18 weeks);
        emit GroupCreated(groupId, depth);
    }

    function createPoll(uint256 pollId, string calldata _text, uint256[] calldata groupIds) external onlyOwner {
        require(bytes(_text).length > 0, "Poll text cannot be empty");
        Poll storage poll = polls[pollId];
        require(bytes(polls[pollId].text).length == 0, "Poll already exists");

        // Initialize the Poll
        poll.state = PollState.Created;
        poll.text = _text;
        for (uint256 i = 0; i < groupIds.length; i++) {
            require(groups[groupIds[i]].isActive, "Group doesn't exists");
            poll.groupsAllowed[groupIds[i]] = true;
        }
        emit PollCreated(pollId, _text);
    }

    function isGroupAllowed(uint256 pollId, uint256 groupId) public view returns (bool) {
        return polls[pollId].groupsAllowed[groupId];
    }

    function isNullifierUsed(uint256 pollId, uint256 nullifierHash) public view returns (bool) {
        return polls[pollId].nullifierHashes[nullifierHash];
    }

    function getVotes(uint256 pollId) public view returns (uint32[] memory) {
        uint32[] memory votes = new uint32[](2);
        votes[0] = polls[pollId].yesCounter;
        votes[1] = polls[pollId].noCounter;
        return votes;
    }

    function castVote(
        uint8 vote,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256 pollId,
        uint256[8] calldata proof,
        uint256 groupId
    ) external {
        require(vote < 2, "Vote > 1");
        require(isGroupAllowed(pollId, groupId), "Group not allowed");
        require(!isNullifierUsed(pollId, nullifierHash), "Used Nullifier");
        verifier.verifyProof(merkleTreeRoot, nullifierHash, vote, pollId, proof, groups[groupId].depth);
        polls[pollId].nullifierHashes[nullifierHash] = true;
        if (vote == 0) {
            polls[pollId].noCounter += 1;
        }
        if (vote == 1) {
            polls[pollId].yesCounter += 1;
        }
        emit VoteCasted(pollId, vote);
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

    /// Survey
    function createSurvey(
        string memory ipfsLink,
        uint256 questionsCount,
        uint256 optionsPerQuestion,
        uint256[] calldata groupIds
    ) public onlyOwner {
        super._createSurvey(ipfsLink, questionsCount, optionsPerQuestion, groupIds);
    }

    function submitSurveyResponse(
        uint256 surveyId,
        uint256 encodedResponses,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        uint256 groupId
    ) public {
        verifier.verifyProof(merkleTreeRoot, nullifierHash, encodedResponses, surveyId, proof, groups[groupId].depth);
        super._submitResponse(surveyId, encodedResponses, nullifierHash, groupId);
    }
}
