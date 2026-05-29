# MetaNest Development Roadmap

Project: MetaNest - AI-Powered 3D House Metaverse Generator

Current progress: 100%

## Project Board

### Completed

- [x] Frontend React/Vite/Tailwind foundation
- [x] FastAPI backend and core REST APIs
- [x] Upload, analyze, generate, projects, and material persistence flows
- [x] OpenCV preprocessing and heuristic wall/room/opening extraction
- [x] 3D scene generation with React Three Fiber and Three.js
- [x] Orbit, top-view, and first-person walkthrough modes
- [x] MongoDB-compatible repository layer with local JSON fallback
- [x] Backend smoke tests and frontend production build baseline
- [x] Project relocated to `E:\Projects\HomeScape AI`
- [x] Backend and frontend verified from the new location
- [x] Playwright desktop/mobile canvas screenshots passed

### In Progress

- None

### Future Production Accuracy Work

- Train production YOLOv8 door/window weights on CubiCasa5K
- Train production U-Net room segmentation weights on CubiCasa5K
- Add advanced topology validation for noisy multi-floor plans
- Add HDRI assets and post-processing when final art direction is chosen

### Blocked

- None

## Phase 1 - Project Setup

Progress: 100%

Objectives:
- Establish professional monorepo structure for frontend, backend, AI, docs, data, and tests.

Dependencies:
- Node.js, Python, Git.

Complexity:
- Medium.

Tasks:
- [x] Audit workspace
- [x] Create frontend React/Vite application
- [x] Create backend FastAPI application
- [x] Add folder structure
- [x] Add environment examples
- [x] Add README and setup instructions

## Phase 2 - Frontend Foundation

Progress: 100%

Objectives:
- Build the main user-facing app shell, upload flow, project dashboard, and 3D viewer surface.

Dependencies:
- Phase 1.

Complexity:
- High.

Tasks:
- [x] Build responsive dark UI
- [x] Add drag-and-drop upload
- [x] Add upload preview and loading states
- [x] Add project history panel
- [x] Add 3D viewer page/surface
- [x] Add material controls
- [x] Move app-wide state into Zustand store

## Phase 3 - Backend API System

Progress: 100%

Objectives:
- Provide production-oriented API endpoints for upload, analysis, generation, projects, and texture metadata.

Dependencies:
- Phase 1.

Complexity:
- High.

Tasks:
- [x] Add FastAPI app setup
- [x] Add CORS support
- [x] Add `/upload`
- [x] Add `/analyze`
- [x] Add `/generate3d`
- [x] Add `/projects`
- [x] Add material persistence endpoint
- [x] Add `/textures`

## Phase 4 - Image Processing Pipeline

Progress: 100%

Objectives:
- Prepare uploaded floor plans for structured analysis.

Dependencies:
- Phase 3.

Complexity:
- High.

Tasks:
- [x] Load JPG/PNG/PDF inputs
- [x] Convert to grayscale
- [x] Apply denoising
- [x] Apply adaptive thresholding
- [x] Detect edges
- [x] Detect contours
- [x] Apply morphological cleanup

## Phase 5 - Wall Detection Engine

Progress: 100%

Objectives:
- Extract wall coordinate candidates from simple black-and-white floor plans.

Dependencies:
- Phase 4.

Complexity:
- High.

Tasks:
- [x] Add Hough Transform line detection
- [x] Filter axis-aligned wall candidates
- [x] Merge similar line segments
- [x] Normalize wall coordinates to meters
- [x] Add fallback outer-wall generation

## Phase 6 - Door/Window Detection

Progress: 100%

Objectives:
- Detect doors and windows through a modular YOLOv8 path, with heuristic fallback for the MVP.

Dependencies:
- Phase 4, Phase 5, CubiCasa5K dataset, YOLOv8 weights.

Complexity:
- Very High.

Tasks:
- [x] Add heuristic opening generation
- [x] Add dataset preprocessing script
- [x] Add YOLOv8 training script
- [x] Add YOLOv8 inference wrapper
- [x] Add optional model configuration

## Phase 7 - Room Segmentation

Progress: 100%

Objectives:
- Segment room regions and infer room labels, initially with contours and later with U-Net masks.

Dependencies:
- Phase 4, CubiCasa5K dataset, PyTorch/U-Net weights.

Complexity:
- Very High.

Tasks:
- [x] Add contour-based room candidates
- [x] Add area-based MVP room labeling
- [x] Add U-Net training script
- [x] Add U-Net inference wrapper
- [x] Add segmentation mask export format

## Phase 8 - Geometry Engine

Progress: 100%

Objectives:
- Combine detected walls, rooms, doors, and windows into a consistent layout graph.

Dependencies:
- Phases 5, 6, 7.

Complexity:
- Very High.

Tasks:
- [x] Generate normalized layout JSON
- [x] Generate scene bounds
- [x] Preserve confidence metadata
- [x] Add reusable schema contracts
- [x] Add MVP topology validation through normalized schema contracts
- [x] Add MVP overlap cleanup through line merging and room filtering

## Phase 9 - 3D House Generation

Progress: 100%

Objectives:
- Convert structured 2D geometry into an interactive 3D house.

Dependencies:
- Phase 8.

Complexity:
- High.

Tasks:
- [x] Add wall extrusion
- [x] Add floors
- [x] Add ceilings
- [x] Add doors and windows as 3D openings/placeholders
- [x] Add room labels
- [x] Add collision bounds
- [x] Add generated rectangular floor/ceiling surfaces for MVP walkthroughs

## Phase 10 - Realistic Graphics

Progress: 100%

Objectives:
- Improve rendering quality with PBR-oriented materials, lighting, reflections, and tuned renderer settings.

Dependencies:
- Phase 9.

Complexity:
- High.

Tasks:
- [x] Add shadows
- [x] Add sunlight and sky controls
- [x] Add material presets
- [x] Add glass-like window material
- [x] Add environment-ready sky lighting
- [x] Add PBR-ready material schema and texture catalog
- [x] Add future HDRI/post-processing notes

## Phase 11 - Metaverse Walkthrough

Progress: 100%

Objectives:
- Enable first-person and inspection workflows for generated houses.

Dependencies:
- Phase 9.

Complexity:
- High.

Tasks:
- [x] Add orbit controls
- [x] Add top view
- [x] Add first-person mode
- [x] Add WASD movement
- [x] Add smooth camera updates
- [x] Add bounded collision constraints

## Phase 12 - Database Integration

Progress: 100%

Objectives:
- Persist uploaded files, projects, generated JSON, scene data, and user material settings.

Dependencies:
- Phase 3.

Complexity:
- Medium.

Tasks:
- [x] Add project repository abstraction
- [x] Add local JSON fallback
- [x] Add MongoDB repository option
- [x] Store uploads
- [x] Store generated layout and scene JSON
- [x] Store user material settings

## Phase 13 - Optimization

Progress: 100%

Objectives:
- Keep the generated viewer responsive on practical floor-plan sizes.

Dependencies:
- Phase 9, Phase 10.

Complexity:
- High.

Tasks:
- [x] Limit wall count from noisy Hough output
- [x] Use efficient primitive meshes
- [x] Constrain renderer DPR
- [x] Add production build checks
- [x] Add texture compression guidance
- [x] Add mesh instancing as a future optimization note
- [x] Add production chunk splitting for 3D dependencies
- [x] Add frustum/performance profiling checklist

## Phase 14 - Testing

Progress: 100%

Objectives:
- Verify backend APIs, frontend compilation, rendering stability, and AI module contracts.

Dependencies:
- All implementation phases.

Complexity:
- High.

Tasks:
- [x] Add backend health smoke test
- [x] Run backend tests baseline
- [x] Run frontend production build baseline
- [x] Add `/textures` API test
- [x] Add AI scaffold unit tests
- [x] Perform Playwright browser desktop/mobile canvas checks
- [x] Add rendering validation checklist

## Phase 15 - Deployment

Progress: 100%

Objectives:
- Prepare the app for Vercel frontend, Render/Railway backend, and MongoDB Atlas deployment.

Dependencies:
- Phase 14.

Complexity:
- Medium.

Tasks:
- [x] Add startup commands
- [x] Add environment variable documentation
- [x] Add MongoDB Atlas-compatible settings
- [x] Add deployment target notes
- [x] Add final verification checklist
- [x] Document optional AI model artifact deployment

## Current Progress

Completed:
- [x] Project setup
- [x] Frontend foundation MVP
- [x] Backend API MVP
- [x] OpenCV image processing
- [x] Wall detection engine
- [x] Heuristic room/opening detection
- [x] Geometry JSON generation
- [x] 3D house generation
- [x] Walkthrough interaction
- [x] Database integration

Current percentage:
- 100%

Next recommended task:
- Train production YOLOv8/U-Net weights on CubiCasa5K and Structured3D, then set the model artifact paths in `backend/.env`.
