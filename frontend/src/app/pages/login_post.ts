import { NextApiRequest, NextApiResponse } from 'next';
import { apiAuth } from '../../utility/axiosInstance';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
        const { email, password } = req.body; 
        const { data } = await apiAuth.post('/login', { email, password });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}