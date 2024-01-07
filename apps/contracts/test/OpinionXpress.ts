import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { run, ethers } from "hardhat"
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
        const { semaphore } = await run("deploy:semaphore", {
            logs: false
        })

        opinionXpress = await run("deploy-opinion", { logs: false, semaphore: semaphore.address })
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
            expect(group).to.equal(true)
        })

        it("Should restrict not-owners from creating a group", async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [owner, other] = await ethers.getSigners()

            await expect(opinionXpress.connect(other).createGroup(groupId, depth)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
            const group = await opinionXpress.groups(groupId)
            expect(group).to.equal(false)
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

})
