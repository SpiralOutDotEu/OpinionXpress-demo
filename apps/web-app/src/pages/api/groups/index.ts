import type { NextApiRequest, NextApiResponse } from 'next';
import { getGroupCreatedEvents } from '../../../services/contractService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
      try {
        // Call the service function to fetch GroupCreated events
        const events = await getGroupCreatedEvents();
  
        // Return the events with a 200 status code
        res.status(200).json(events);
      } catch (error) {
        console.error(error);
  
        // Handle errors appropriately
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }
