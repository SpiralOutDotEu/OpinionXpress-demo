/**
 * Encodes an array of survey responses into a single uint256 value using 3 bits per response.
 * This allows for up to 8 options per question.
 * @param responses An array of response indices, where each index corresponds to a selected option for a question.
 * @returns The encoded responses as a single uint256 value in hexadecimal string format.
 */
export function encodeResponses(responses: number[]): string {
    let encoded = BigInt(0) // Use BigInt for handling numbers beyond JavaScript's safe integer limit
    responses.forEach((response, index) => {
        if (response < 0 || response > 7) {
            throw new Error("Invalid response: each response must be between 0 and 7 inclusive.")
        }
        encoded |= BigInt(response) << (BigInt(3) * BigInt(index))
    })
    // Convert the encoded number to a hex string to represent a uint256 value
    return `${encoded.toString(16)}`
}

/**
 * Decodes a single uint256 value into an array of survey responses using 3 bits per response.
 * This assumes there are up to 8 options per question, fitting within 3 bits.
 * @param encodedResponses The encoded responses as a single uint256 value in hexadecimal string format.
 * @param numberOfResponses The number of responses to decode. This should be known beforehand or derived from context.
 * @returns An array of response indices, where each index corresponds to a selected option for a question.
 */
export function decodeResponses(encodedResponses: string, numberOfResponses: number): number[] {
    const encoded = BigInt(`0x${encodedResponses}`) // Convert hex string back to BigInt
    const responses = []
    const mask = BigInt(7) // Binary 111, which corresponds to 3 bits

    console.log(`Decoding encodedResponses: ${encodedResponses} into ${numberOfResponses} responses`)

    for (let i = 0; i < numberOfResponses; i += 1) {
        const shifted = encoded >> (BigInt(3) * BigInt(i))
        const response = Number(shifted & mask)
        responses.push(response)

        console.log(`Response ${i}: ${response}`)
    }

    return responses
}
