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
- Texture preset catalog served by the backend
- Automatic room labels and simple furniture placement
- Scene JSON export
- FastAPI project persistence with MongoDB support and local JSON fallback
- Optional YOLOv8 and U-Net training/inference scaffolds for production AI model artifacts

## Project Structure

```text
MetaNest/
  backend/
    app/
      ai/                   optional YOLOv8 and U-Net inference wrappers
      api/                  REST routes
      core/                 settings
      models/               Pydantic contracts
      services/             upload, OpenCV, 3D scene generation
      storage/              MongoDB/JSON repositories
    scripts/                dataset preprocessing, training, and inference scripts
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

## Demo Assets

The repo includes synthetic demo floor plans, YOLO labels, and room masks under `docs/demo-assets/dummy_raw`. See `docs/DEMO.md` for a local end-to-end walkthrough.

To regenerate the sample set:

```bash
python backend/scripts/generate_dummy_data.py --output docs/demo-assets/dummy_raw --num-images 3
```

## API

- `GET /health` - service health check
- `POST /upload` - upload JPG, PNG, or PDF floor plan
- `POST /analyze` - run OpenCV analysis for a project
- `POST /generate3d` - generate browser-ready scene data
- `GET /projects` - list saved projects
- `GET /projects/{project_id}` - fetch one project
- `GET /textures` - list supported material/texture presets
- `PATCH /projects/{project_id}/materials` - save wall, floor, and sunlight settings

## Optional AI Training

The default MVP runs with OpenCV and rule-based geometry, which keeps local setup light. To train or run learned detectors, install the AI extras:

See `docs/AI_TRAINING_NEXT_STEPS.md` for the production training checklist.

```bash
cd backend
pip install -r requirements-ai.txt
```

YOLOv8 door/window workflow:

```bash
python scripts/preprocess_cubicasa_openings.py --images path\to\images --labels path\to\labels --output data\openings
python scripts/train_yolo_openings.py --data data\openings\dataset.yaml --epochs 80
python scripts/infer_yolo_openings.py --image sample.png --model runs\metanest-openings\doors-windows\weights\best.pt
```

U-Net room segmentation workflow:

```bash
python scripts/train_unet_rooms.py --images path\to\images --masks path\to\masks --output models\unet_rooms.pt
python scripts/infer_unet_rooms.py --image sample.png --model models\unet_rooms.pt --output room_mask.png
```

Enable trained artifacts in `backend/.env`:

```env
YOLO_OPENING_MODEL_PATH=models/openings.pt
UNET_ROOM_MODEL_PATH=models/unet_rooms.pt
```

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

Deployment targets:

- Frontend: Vercel. Set `VITE_API_URL` to the deployed backend URL.
- Backend: Render or Railway. Start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Database: MongoDB Atlas. Set `MONGODB_URI` and `MONGODB_DATABASE`.
- AI artifacts: store trained weights on persistent backend storage or object storage mounted/downloaded during release.

## Verification

```bash
cd backend
pytest

cd ../frontend
npm run build
npm run verify:viewer
```

The viewer verification script expects the frontend dev server to be running and writes desktop/mobile screenshots to `docs/verification`.

