# MetaNest Development Roadmap

Current progress: 90%

## Project Board

### TODO

- Start local API and frontend dev servers
- Perform browser viewport checks
- Add deployment target-specific notes

### IN PROGRESS

- Phase 9: testing, performance, and hardening
- Phase 10: final deployment-ready documentation

### COMPLETED

- Phase 1: project setup
- Phase 2: frontend upload experience
- Phase 3: backend APIs
- Phase 4: OpenCV processing pipeline
- Phase 5: 3D generation engine
- Phase 6: metaverse interaction
- Phase 7: materials, themes, and optional intelligence
- Phase 8: database integration

### BLOCKED

- None

### FUTURE FEATURES

- VR mode with WebXR
- Multiplayer metaverse rooms
- AI interior design with object placement models
- Real-time collaboration cursors and scene edits
- Voice commands
- Multi-floor parsing and stair inference

## Phase 1 - Project Setup, 10%

Status: completed

- [x] Audit current workspace
- [x] Create frontend React + Tailwind structure
- [x] Create backend FastAPI structure
- [x] Define shared layout/project JSON contracts
- [x] Add env examples and install instructions
- [x] Add root README and scripts

## Phase 2 - Frontend Upload Experience, 10%

Status: completed

- [x] Futuristic app shell and responsive layout
- [x] Drag-and-drop upload component
- [x] JPG/PNG/PDF validation and size checks
- [x] Image/PDF preview state
- [x] Upload progress/loading/error states
- [x] API client service

## Phase 3 - Backend APIs, 12%

Status: completed

- [x] FastAPI app setup with CORS
- [x] `/upload` endpoint
- [x] `/analyze` endpoint
- [x] `/generate3d` endpoint
- [x] `/projects` list and retrieval endpoints
- [x] Material persistence endpoint
- [x] Centralized HTTP error responses

## Phase 4 - OpenCV Processing Pipeline, 14%

Status: completed

- [x] Convert images/PDF pages to processable images
- [x] Grayscale conversion
- [x] Thresholding and cleanup
- [x] Edge detection
- [x] Hough/contour wall detection
- [x] Room candidate extraction
- [x] Door/window heuristic detection
- [x] Normalized layout JSON output

## Phase 5 - 3D Generation Engine, 14%

Status: completed

- [x] React Three Fiber scene
- [x] Wall extrusion from 2D coordinates
- [x] Floor and ceiling generation
- [x] Room labels/metadata rendering
- [x] Lighting, shadows, environment setup
- [x] Geometry/material optimization basics

## Phase 6 - Metaverse Interaction, 10%

Status: completed

- [x] Orbit controls
- [x] Top-view mode
- [x] First-person mode
- [x] WASD movement
- [x] Mouse-look controls
- [x] Basic bounded collision constraints

## Phase 7 - Materials, Themes, and Interior Intelligence, 8%

Status: completed

- [x] Wall color controls
- [x] Floor texture/theme controls
- [x] Wood/marble/tile/concrete/paint presets
- [x] Sunlight simulation
- [x] Simple automatic furniture placement
- [x] Export scene data

## Phase 8 - Database Integration, 8%

Status: completed

- [x] MongoDB-compatible repository layer
- [x] Local JSON fallback for easy development
- [x] Project persistence on upload/analyze/generate
- [x] Project listing and retrieval
- [x] Texture/theme setting persistence

## Phase 9 - Testing, Performance, and Hardening, 8%

Status: in progress

- [x] Backend smoke test file
- [x] Backend test execution
- [x] Frontend production build
- [x] API contract validation through shared schemas/types
- [x] Upload edge-case handling
- [ ] 3D viewport desktop/mobile checks
- [x] Performance-conscious R3F rendering primitives

## Phase 10 - Deployment Readiness, 6%

Status: in progress

- [x] Root README
- [x] `.env.example` files
- [x] Startup commands
- [ ] Final verification notes
- [x] Future architecture notes for VR, multiplayer, collaboration, voice

## Next Recommended Action

Start both local servers, perform browser viewport checks, then add deployment target-specific notes.
