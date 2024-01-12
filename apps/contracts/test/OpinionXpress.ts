import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { run, ethers } from "hardhat"
import { faker } from '@faker-js/faker';
// @ts-ignore: typechain folder will be generated after contracts compilation
import { OpinionXpress } from "../build/typechain"
import { config } from "../package.json"

describe("OpinionXpress", () => {
    let opinionXpress: OpinionXpress
    let semaphoreContract: string

    const groupId = 42
    const depth = 20
    const users: Identity[] = []

    beforeEach(async () => {
        const { semaphore, semaphoreVerifierAddress } = await run("deploy:semaphore", {
            logs: false
        })

        opinionXpress = await run("deploy-opinion", {
            logs: false,
            semaphore: semaphore.address,
            verifier: semaphoreVerifierAddress
        })
        semaphoreContract = semaphore

        users.push(new Identity())
        users.push(new Identity())
    })

    describe("# Group Management", () => {
        it("Should allow the owner to create a group", async () => {
            await expect(opinionXpress.createGroup(groupId, depth))
                .to.emit(opinionXpress, "GroupCreated")
                .withArgs(groupId)
            const group = await opinionXpress.groups(groupId)
            expect(group.isActive).to.equal(true)
            expect(group.depth).to.equal(depth)
        })

        it("Should restrict not-owners from creating a group", async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [owner, other] = await ethers.getSigners()

            await expect(opinionXpress.connect(other).createGroup(groupId, depth)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
            const group = await opinionXpress.groups(groupId)
            expect(group.isActive).to.equal(false)
        })

        it("Should allow the owner to change group admin", async () => {
            const [owner, newGroupAdmin] = await ethers.getSigners()
            await expect(opinionXpress.connect(owner).changeGroupAdmin(newGroupAdmin.address))
                .to.emit(opinionXpress, "GroupAdminChanged")
                .withArgs(newGroupAdmin.address)
        })

        it("Should allow the group admin to add commitments", async () => {
            const [owner, groupAdmin] = await ethers.getSigners()
            // set group admin
            await opinionXpress.connect(owner).changeGroupAdmin(groupAdmin.address)
            // create off-chain group
            const group = new Group(groupId, depth)
            // create on-chain group
            await opinionXpress.connect(owner).createGroup(groupId, depth)
            // add off-chain 1st member
            group.addMember(users[0].commitment)
            // add on-chain 1st member
            await expect(opinionXpress.connect(groupAdmin).addMember(groupId, users[0].commitment))
                .to.emit(semaphoreContract, "MemberAdded")
                .withArgs(groupId, 0, BigInt(users[0].commitment), group.root)
            // add off-chain 2nd member
            group.addMember(users[1].commitment)
            // add on-chain 2nd member
            await expect(opinionXpress.connect(groupAdmin).addMember(groupId, users[1].commitment))
                .to.emit(semaphoreContract, "MemberAdded")
                .withArgs(groupId, 1, BigInt(users[1].commitment), group.root)
        })
    })
    describe("# Commitment Management", () => {
        it("Should allow the group admin to add a member commitment to a group ", async () => {
            const [owner, groupAdmin] = await ethers.getSigners()
            await opinionXpress.connect(owner).changeGroupAdmin(groupAdmin.address)
            // create off-chain group
            const group = new Group(groupId, depth)
            // create on-chain group
            await opinionXpress.connect(owner).createGroup(groupId, depth)
            // add off-chain 1st member
            group.addMember(users[0].commitment)
            // add on-chain 1st member
            await expect(opinionXpress.connect(groupAdmin).addMember(groupId, users[0].commitment))
                .to.emit(semaphoreContract, "MemberAdded")
                .withArgs(groupId, 0, BigInt(users[0].commitment), group.root)
            // add off-chain 2nd member
            group.addMember(users[1].commitment)
            // add on-chain 2nd member
            await expect(opinionXpress.connect(groupAdmin).addMember(groupId, users[1].commitment))
                .to.emit(semaphoreContract, "MemberAdded")
                .withArgs(groupId, 1, BigInt(users[1].commitment), group.root)
        })

        it("Should allow the group admin to change a commitment", async () => {
            const [owner, groupAdmin] = await ethers.getSigners()
            await opinionXpress.connect(owner).changeGroupAdmin(groupAdmin.address)
            // create off-chain group
            const group = new Group(groupId, depth)
            // create on-chain group
            await opinionXpress.connect(owner).createGroup(groupId, depth)
            // off-chain add members to group
            group.addMembers([users[0].commitment, users[1].commitment])
            // add on-chain 1st member
            await opinionXpress.connect(groupAdmin).addMember(groupId, users[0].commitment)
            // add on-chain 2nd member
            await opinionXpress.connect(groupAdmin).addMember(groupId, users[1].commitment)

            // create new identity
            const newIdentity = new Identity()
            // update off-chain on index 1 and set new commitment
            group.updateMember(1, newIdentity.commitment)
            // get off-chain proofs for index 1
            const { siblings, pathIndices, root } = group.generateMerkleProof(1)
            // update on-chain
            const transaction = opinionXpress
                .connect(groupAdmin)
                .updateMember(groupId, users[1].commitment, newIdentity.commitment, siblings, pathIndices)

            // assert
            await expect(transaction)
                .to.emit(semaphoreContract, "MemberUpdated")
                .withArgs(groupId, 1, users[1].commitment, newIdentity.commitment, root)
        })
    })
    describe("# Poll Management", () => {
        it("Should allow owner to create a poll", async () => {
            const [owner] = await ethers.getSigners()
            const pollId = 1
            const pollText = "Some poll text"
            const allowedGroups = [101, 202]

            // create off-chain groups
            const group1 = new Group(allowedGroups[0], 20)
            const group2 = new Group(allowedGroups[1], 20)
            // create on-chain group
            await opinionXpress.connect(owner).createGroup(group1.id, depth)
            await opinionXpress.connect(owner).createGroup(group2.id, depth)

            // Create Poll
            const transaction = await opinionXpress.connect(owner).createPoll(pollId, pollText, allowedGroups)
            await expect(transaction).to.emit(opinionXpress, "PollCreated").withArgs(pollId, pollText)

            // Get Poll Details
            const poll = await opinionXpress.polls(pollId)

            // Check Poll Details
            expect(poll.state).to.equal(0)
            expect(poll.yesCounter).to.equal(0)
            expect(poll.noCounter).to.equal(0)
            expect(poll.text).to.equal(pollText)
            // Check if allowedGroups are set correctly in the groupsAllowed mapping
            for (let i = 0; i < allowedGroups.length; i += 1) {
                expect(await opinionXpress.isGroupAllowed(pollId, allowedGroups[i])).to.equal(true)
            }
        })

        it("Should restrict others from creating a poll", async () => {
            const [owner, other] = await ethers.getSigners()
            const pollId = 1
            const pollText = "Some poll text"
            const allowedGroups = [101, 202]

            // create off-chain groups
            const group1 = new Group(allowedGroups[0], 20)
            const group2 = new Group(allowedGroups[1], 20)
            // create on-chain group
            await opinionXpress.connect(owner).createGroup(group1.id, depth)
            await opinionXpress.connect(owner).createGroup(group2.id, depth)

            // Create Poll
            const transaction = opinionXpress.connect(other).createPoll(pollId, pollText, allowedGroups)
            await expect(transaction).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
    describe("# Voting", () => {
        const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
        const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

        it("Cast votes (Happy Path)", async () => {
            const [owner] = await ethers.getSigners();
            const pollId = 1;
            const pollText = "Some poll text";
        
            // Create off-chain groups
            const group = new Group(groupId, depth);
            // Create on-chain group
            await opinionXpress.connect(owner).createGroup(group.id, depth);
        
            // Create Poll
            await opinionXpress.connect(owner).createPoll(pollId, pollText, [group.id]);
        
            let totalYesVotes = 0;
            let totalNoVotes = 0;
        
            // Create and cast votes for multiple voters
            for (let i = 0; i < 3; i+=1) { // Adjusted to 3 voters
                // Create new identity for each voter
                const voter = new Identity();
                // Update off-chain and set new commitment
                group.addMember(voter.commitment);
                // Add on-chain member
                await opinionXpress.connect(owner).addMember(groupId, voter.commitment);
        
                // Generate a random vote using faker
                const vote = faker.number.int({ min: 0, max: 1 });
        
                // Track the total votes
                if (vote === 1) {
                    totalYesVotes+=1;
                } else {
                    totalNoVotes+=1;
                }
        
                // Generate proofs and cast vote on-chain
                const fullProof = await generateProof(voter, group, pollId, vote, {
                    wasmFilePath,
                    zkeyFilePath
                });
                const transaction = await opinionXpress.castVote(
                    fullProof.signal,
                    fullProof.merkleTreeRoot,
                    fullProof.nullifierHash,
                    fullProof.externalNullifier,
                    fullProof.proof,
                    groupId
                );
        
                // Expect VoteCasted event
                await expect(transaction).to.emit(opinionXpress, "VoteCasted").withArgs(pollId, vote);
            }
        
            // Retrieve and assert vote counts
            const votes = await opinionXpress.getVotes(pollId);
            await expect(votes[0]).to.equal(totalYesVotes);
            await expect(votes[1]).to.equal(totalNoVotes);
        });
    })
})
