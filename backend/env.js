import dotenv from 'dotenv';

// Load .env.local first (local overrides / Vercel pull), then .env
dotenv.config({ path: '.env.local' });
dotenv.config();
