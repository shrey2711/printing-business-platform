# Printing Business Platform

A modern React + Node.js web application for an online printing business similar to B2Sign.

A wholesale large-format print storefront (banners, signs, flags, displays) with
**instant online pricing**, modeled after trade printers like B2Sign.

## Features

- Responsive storefront with wholesale/trade messaging
- Large-format product catalog with category filtering
- **Instant price calculator** — live pricing by size, material, finishing & quantity
- Volume discount tiers and free-shipping thresholds
- Quote / order request flow with artwork upload (prefilled from the configurator)
- Product & pricing REST API (`/api/products`, `/api/price`, `/api/quote`)

## Project structure

- frontend: React + Vite client
- backend: Express.js API

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start both apps:
   ```bash
   npm run dev
   ```
3. Open the frontend at http://localhost:3000
4. API is available at http://localhost:5000
