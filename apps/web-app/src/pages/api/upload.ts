import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const uploadDir = './private/uploads';

const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const moveFile = (oldPath: string, newPath: string) => {
  fs.renameSync(oldPath, newPath);
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    ensureDirectoryExists(uploadDir);

  
    return res.status(200).json({ success: true, message: 'File uploaded privately.', fileName: "new_filename" });

};
