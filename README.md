# ExpenseFlow — Personal Finance Dashboard

A frontend-only expense tracker built with React, Vite, Recharts and browser LocalStorage.

## Features
- Dashboard with income, expenses, balance and savings rate
- Add, edit and delete transactions
- Search and filter by type/category
- Monthly income vs expense chart and category breakdown
- Category budgets with progress indicators
- CSV export
- Light/dark theme
- Responsive layout
- LocalStorage persistence; no backend or API required

## Run locally
1. Install Node.js 18 or newer.
2. Extract the ZIP and open this folder in VS Code.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL printed by Vite.

## Build check
```bash
npm run build
npm run preview
```

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel choose **Add New → Project** and import the repository.
3. Framework preset: **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**.

`vercel.json` includes a simple SPA rewrite. No environment variables are needed.

## Data and privacy
Transactions and budgets are stored in this browser's LocalStorage. Data does not sync across devices or browsers. Clearing site data may remove it. This is a frontend demonstration, not a secure financial record system. Do not enter sensitive banking credentials.

## Academic / portfolio note
You can accurately describe this as a frontend-focused React project demonstrating component-based UI, state management, charts, responsive CSS, CRUD interactions and browser storage. Customize the branding, categories and sample data, and make sure you understand the code before presenting it.
