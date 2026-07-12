import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Printing API is running' });
});

app.post('/api/quote', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: 'Quote request received',
    data: {
      name: req.body.name,
      email: req.body.email,
      description: req.body.description,
      file: req.file ? req.file.filename : null
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
