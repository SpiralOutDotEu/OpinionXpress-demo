import type { NextApiRequest, NextApiResponse } from 'next';
import { addMemberToContract } from '../../services/contractService';

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

      const transactionHash = await addMemberToContract(groupId, commitment);
      res.status(200).json({ message: 'Member added successfully', transactionHash });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
