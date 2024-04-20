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
        encoded |= BigInt(response) << (BigInt(3) * BigInt(index)) // Using 3 bits for encoding each response
    })
    // Convert the encoded number to a hex string to represent a uint256 value
    // return `${encoded.toString(16)}`
    return encoded.toString()
}

/**
 * Decodes a single uint256 value into an array of survey responses using 3 bits per response.
 * This assumes there are up to 8 options per question, fitting within 3 bits.
 * @param encodedResponses The encoded responses as a single uint256 value in hexadecimal string format.
 * @param numberOfResponses The number of responses to decode. This should be known beforehand or derived from context.
 * @returns An array of response indices, where each index corresponds to a selected option for a question.
 */
export function decodeResponses(encodedResponses: string, numberOfResponses: number): number[] {
    const encodedBigInt = BigInt(`${encodedResponses}`)
    const responses = []
    for (let i = 0; i < numberOfResponses; i += 1) {
        const response = Number((encodedBigInt >> (BigInt(3) * BigInt(i))) & BigInt(3))
        responses.push(response)
    }
    return responses
}
