const ipfsGateway = process.env.IPFS_GATEWAY

// eslint-disable-next-line import/prefer-default-export
export async function getIpfsFile(cidOrLink: string) {
    try {
        const cid = cidOrLink.startsWith('ipfs://') ? cidOrLink.substring(7) : cidOrLink;
        const call_url = `${ipfsGateway}/${cid}`
        const response = await fetch(call_url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const content = await response.text()
        const jsonContent = JSON.parse(content)
        return jsonContent
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message)
        throw new Error("Failed to fetch IPFS content")
    }
}
