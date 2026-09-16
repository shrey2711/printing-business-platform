// Local development entry point. Vercel uses /api/index.js instead.
import './env.js';
import app from './app.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
