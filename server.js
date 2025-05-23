import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

const upload = multer({ dest: 'uploads/' });
app.use(express.static(path.join(__dirname, 'public')));

const convertedDir = path.join(__dirname, 'converted');
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir);

app.post('/upload', upload.single('tdmsFile'), (req, res) => {
  const inputPath = req.file.path;
  const outputFilename = req.file.originalname.replace('.tdms', '.csv');
  const outputPath = path.join(convertedDir, outputFilename);

  const pyProcess = spawn('python3', ['convert_tdms.py', inputPath, outputPath]);

  pyProcess.on('close', (code) => {
    fs.unlinkSync(inputPath); // cleanup uploaded .tdms
    if (code === 0) {
      res.send(`TDMS converted and saved as ${outputFilename}`);
    } else {
      res.status(500).send('TDMS conversion failed.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});