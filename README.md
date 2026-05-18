# MetaNest - AI-Powered 3D House Metaverse Generator

MetaNest converts 2D house floor plans into interactive browser-based 3D environments. It combines a FastAPI/OpenCV backend with a React, Tailwind CSS, Three.js, and React Three Fiber frontend.

## Features

- Drag-and-drop upload for JPG, PNG, and PDF floor plans
- Upload preview, type validation, size validation, progress states, and API errors
- OpenCV pipeline for grayscale conversion, thresholding, edge detection, Hough wall detection, room contours, and opening heuristics
- Structured layout JSON with walls, rooms, doors, and windows
- Interactive 3D generation from 2D coordinates
- Orbit, top-view, and first-person walkthrough modes
- WASD movement and bounded first-person navigation
- Wall color, floor texture, and sunlight controls
- Automatic room labels and simple furniture placement
- Scene JSON export
- FastAPI project persistence with MongoDB support and local JSON fallback

## Project Structure

```text
MetaNest/
  backend/
    app/
      api/                  REST routes
      core/                 settings
      models/               Pydantic contracts
      services/             upload, OpenCV, 3D scene generation
      storage/              MongoDB/JSON repositories
    data/                   local project database fallback
    uploads/                uploaded floor plans
    tests/                  API smoke tests
  frontend/
    src/
      components/           reusable UI and 3D viewer components
      services/             API client
      types/                shared TypeScript contracts
      utils/                demo scene fallback
  docs/
    ROADMAP.md              living project board and progress tracker
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

The API will run at `http://localhost:8000`.

### Optional MongoDB

By default, projects are stored in `backend/data/projects.json`. To use MongoDB, set these values in `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=metanest
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The app will run at `http://localhost:5173`.

## API

- `GET /health` - service health check
- `POST /upload` - upload JPG, PNG, or PDF floor plan
- `POST /analyze` - run OpenCV analysis for a project
- `POST /generate3d` - generate browser-ready scene data
- `GET /projects` - list saved projects
- `GET /projects/{project_id}` - fetch one project
- `PATCH /projects/{project_id}/materials` - save wall, floor, and sunlight settings

## Layout JSON

```json
{
  "walls": [
    {
      "start": [0, 0],
      "end": [10, 0],
      "thickness": 0.18,
      "confidence": 0.82
    }
  ],
  "rooms": [],
  "doors": [],
  "windows": []
}
```

## Development Notes

The OpenCV detector uses practical heuristics that work well as an MVP for clean blueprints and scanned plans. For production accuracy, the next architectural step is to add trained segmentation models for wall/opening detection and a calibration step for scale inference.

## Verification

```bash
cd backend
pytest

cd ../frontend
npm run build
```

