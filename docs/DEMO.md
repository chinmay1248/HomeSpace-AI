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

Open `http://localhost:5173`.

## Demo Flow

1. Upload `docs/demo-assets/dummy_raw/images/dummy_0.png`.
2. Wait for the upload preview and project record to appear.
3. Run analysis to extract walls, rooms, doors, and windows.
4. Generate the 3D scene from the analyzed layout.
5. Switch between orbit, top-view, and first-person modes.
6. Adjust wall material, floor material, and sunlight settings.
7. Export the generated scene JSON for review or handoff.

## Included Assets

- `docs/demo-assets/dummy_raw/images` contains simple synthetic floor-plan images.
- `docs/demo-assets/dummy_raw/labels` contains YOLO-format door/window labels.
- `docs/demo-assets/dummy_raw/masks` contains U-Net-style room masks.

Regenerate the assets with:

