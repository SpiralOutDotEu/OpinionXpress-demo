import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { run, ethers } from "hardhat"
import { faker } from "@faker-js/faker"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { OpinionXpress } from "../build/typechain"
import { config } from "../package.json"

describe("OpinionXpress - Survey", () => {
    let opinionXpress: OpinionXpress

    let group: Group

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

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

        users.push(new Identity())
        users.push(new Identity())

        const [owner] = await ethers.getSigners()

        // Create off-chain groups
        group = new Group("101", 20)
        group.addMember(users[0].commitment)
        group.addMember(users[1].commitment)
        // Create on-chain group
        await opinionXpress.connect(owner).createGroup(group.id, 20)
        await opinionXpress.connect(owner).addMember(group.id, users[0].commitment)
    })

    it("Should allow the owner to create a survey", async () => {
        const ipfsLink = faker.internet.url()
        const questionsCount = faker.number.int({ min: 1, max: 10 })
        const optionsPerQuestion = faker.number.int({ min: 1, max: 5 })
        const allowedGroupIds = faker.helpers.arrayElements([1, 10, 100, 200, 300])
        await expect(opinionXpress.createSurvey(ipfsLink, questionsCount, optionsPerQuestion, allowedGroupIds))
            .to.emit(opinionXpress, "SurveyCreated")
            .withArgs(0, ipfsLink, questionsCount, optionsPerQuestion)
        const survey = await opinionXpress.getSurvey(0)
        expect(survey.ipfsLink).to.equal(ipfsLink)
        expect(survey.questionsCount).to.equal(questionsCount)
        expect(survey.optionsPerQuestion).to.equal(optionsPerQuestion)

        const expectedResults = Array.from({ length: questionsCount }, () => Array(optionsPerQuestion).fill(0))
        expect(survey.results).to.deep.equal(expectedResults)
    })

    it("Should revert when a non-owner tries to create a survey", async () => {
        const [, nonOwner] = await ethers.getSigners()
        const ipfsLink = faker.internet.url()
        const questionsCount = faker.number.int({ min: 1, max: 10 })
        const optionsPerQuestion = faker.number.int({ min: 1, max: 5 })
        const allowedGroupIds = faker.helpers.arrayElements([1, 10, 100, 200, 300])

        await expect(
            opinionXpress.connect(nonOwner).createSurvey(ipfsLink, questionsCount, optionsPerQuestion, allowedGroupIds)
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    describe("Submit Survey", () => {
        async function surveyCreatedFixture() {
            const [owner, user1, user2] = await ethers.getSigners()
            // Create a survey first
            const ipfsLink = faker.internet.url()
            const questionsCount = faker.number.int({ min: 1, max: 10 })
            const optionsPerQuestion = faker.number.int({ min: 1, max: 5 })
            const allowedGroups = [101]
            await opinionXpress.connect(owner).createSurvey(ipfsLink, questionsCount, optionsPerQuestion, allowedGroups)
            const surveyId = 0
            return { owner, user1, user2, ipfsLink, questionsCount, optionsPerQuestion, allowedGroups, surveyId }
        }

        it("Should allow submitting responses once per user and accurately update the survey results", async () => {
            const { user1, questionsCount, optionsPerQuestion, surveyId } = await loadFixture(surveyCreatedFixture)
            // Generate random responses for each question
            const responses = Array.from({ length: questionsCount }, () =>
                faker.number.int({ min: 0, max: optionsPerQuestion - 1 })
            )

            // Encode the responses
            let encodedResponses = 0
            responses.forEach((response, index) => {
                encodedResponses |= response << (index * 2) // Assuming 2 bits per response
            })

            // Generate proofs
            const fullProof = await generateProof(users[0], group, surveyId, encodedResponses, {
                wasmFilePath,
                zkeyFilePath
            })
            const transaction = await opinionXpress
                .connect(user1)
                .submitSurveyResponse(
                    fullProof.externalNullifier,
                    fullProof.signal,
                    fullProof.merkleTreeRoot,
                    fullProof.nullifierHash,
                    fullProof.proof,
                    group.id
                )
            // Submit the responses and expect an event
            await expect(transaction)
                .to.emit(opinionXpress, "SurveyResponseSubmitted")
                .withArgs(surveyId, encodedResponses)

            // User cannot submit twice
            await expect(
                opinionXpress
                    .connect(user1)
                    .submitSurveyResponse(
                        fullProof.externalNullifier,
                        fullProof.signal,
                        fullProof.merkleTreeRoot,
                        fullProof.nullifierHash,
                        fullProof.proof,
                        group.id
                    )
            ).to.be.revertedWith("Already Submitted")

            // Retrieve the updated survey results
            const survey = await opinionXpress.getSurvey(0)

            // Create an expected results array
            const expectedResults = Array.from({ length: questionsCount }, () => Array(optionsPerQuestion).fill(0))
            responses.forEach((response, index) => {
                expectedResults[index][response] += 1
            })

            expect(survey.results).to.deep.equal(expectedResults)
        })
    })
})
