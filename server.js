import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8053;

// Configure Multer
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure converted output folder exists
const convertedDir = path.join(__dirname, 'converted');
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir);

// Handle file + form upload
app.post('/upload', upload.single('tdmsFile'), (req, res) => {
  const inputPath = req.file.path;
  const outputFilename = req.file.originalname.replace('.tdms', '.csv');
  const outputPath = path.join(convertedDir, outputFilename);

  const {
    articleId,
    testType,
    testDate,
    testOperator,
    ambientBuildingTemp,
    ambientTemp
  } = req.body;

  const args = [
    'convert_tdms.py',
    inputPath,
    outputPath,
    articleId,
    testType,
    testDate,
    testOperator,
    ambientBuildingTemp,
    ambientTemp
  ];

  const pyProcess = spawn('python3', args);

  pyProcess.stdout.on('data', data => {
    console.log(`PYTHON: ${data}`);
  });

  pyProcess.stderr.on('data', data => {
    console.error(`PYTHON ERROR: ${data}`);
  });

  pyProcess.on('close', code => {
    fs.unlinkSync(inputPath); // Clean up .tdms upload
    if (code === 0) {
      res.send(`TDMS converted and saved as ${outputFilename}`);
    } else {
      res.status(500).send('TDMS conversion failed.');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TDMS Uploader running at http://localhost:${PORT}`);
});