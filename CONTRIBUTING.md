# Contributing to MetaNest

Thanks for your interest in contributing! This guide covers the workflow and conventions we use.

## Getting Started

1. Fork and clone the repository.
2. Set up both the backend and frontend as described in [README.md](README.md).
3. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

## Development Workflow

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Run tests before committing:

```bash
pytest -v
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Verify the production build compiles:

```bash
npm run build
```

## Code Style

| Area       | Convention                                         |
|------------|----------------------------------------------------|
| Python     | Follow PEP 8. Use type hints on all public APIs.   |
| TypeScript | Strict mode. Prefer `interface` over `type` where applicable. |
| Commits    | Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`). |
| Branches   | `feat/`, `fix/`, `docs/`, `chore/` prefixes.       |

## Pull Requests

1. Keep PRs focused — one feature or fix per PR.
2. Include a clear description of **what** changed and **why**.
3. Ensure all tests pass (`pytest` for backend, `npm run build` for frontend).
4. Add tests for new API endpoints or complex logic.

## Project Structure

Refer to the [README.md](README.md) for the full project tree and architecture overview.

## Questions?

Open an issue for bugs, feature requests, or questions about the architecture.
