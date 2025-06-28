import fs from 'fs';
import { extractTextFromFile } from '../utils/textExtractor.js';
import { DocumentLine } from '../models/document.model.js';

export const checkPlagiarismController = async (req, res) => {
  const filePath = req.file.path;
  let text = '';

  try {
    text = await extractTextFromFile(filePath);

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let matched = 0;

    for (const line of lines) {
      const result = await DocumentLine.find({ $text: { $search: `"${line}"` } });
      if (result.length > 0) matched++;
    }

    const matchPercent = (matched / lines.length) * 100;

    if (matchPercent <= 30) {
      const docsToInsert = lines.map(line => ({
      filename: req.file.originalname,
      content: line
      }));

      await DocumentLine.insertMany(docsToInsert);
    }

    
    fs.unlinkSync(filePath);

    res.status(200).json({
      matchPercent,
      message: 'Plagarism checked'
    });

  } catch (err) {
    console.error(err);
    fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



