# MetaNest Demo Guide

Use this guide to run a local end-to-end demo with the included synthetic floor-plan assets.

## Prerequisites

- Python backend dependencies installed from `backend/requirements.txt`
- Frontend dependencies installed with `npm install` in `frontend`
- Optional: MongoDB if you want database persistence instead of the local JSON fallback

## Start The App

From one terminal:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

From a second terminal:

```bash
cd frontend
npm run dev
```

