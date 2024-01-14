import type { NextApiRequest, NextApiResponse } from 'next';
import { Defender } from '@openzeppelin/defender-sdk';
import { ethers } from 'ethers';
import opinionXpressABI  from "../../../ABIs/OpinionXpress.json";

type Data = {
  message: string;
  transactionHash?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    try {
      const { commitment, groupId } = req.body;

      if (!commitment || !groupId) {
        res.status(400).json({ message: 'Missing identityCommitment or groupId' });
        return;
      }

      const { RELAYER_API_KEY, RELAYER_API_SECRET, OPINION_X_PRESS_CONTRACT_ADDRESS} = process.env;

      const credentials = { 
        relayerApiKey: RELAYER_API_KEY, 
        relayerApiSecret: RELAYER_API_SECRET 
      };
      const client = new Defender(credentials);

      const provider = client.relaySigner.getProvider();
      const signer = client.relaySigner.getSigner(provider, { speed: 'fast' });

      const opinionXpress = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, signer);

      const tx = await opinionXpress.addMember(groupId, commitment);
      const mined = await tx.wait();

      res.status(200).json({ message: 'Member added successfully', transactionHash: mined.transactionHash });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}