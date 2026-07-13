// Vercel Serverless Function entry point.
// vercel.json rewrites every /api/* request to this handler, and the Express
// app (which defines /api/... routes) handles it.
import app from '../backend/app.js';

export default function handler(req, res) {
  return app(req, res);
}
