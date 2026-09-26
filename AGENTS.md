# Agent Context & Workspace Instructions

## Overview
This repository (`arc-debug-photo-demo`) is a photo management demonstration built with Express 5, Multer 2, and Node.js 22.

## Key Architecture & Design Choices
- **Storage**: Photos are stored in `.data/photos/<sha256>`. The photo ID is the SHA-256 hash of the raw binary payload.
- **Fidelity**: Files are stored and served byte-for-byte. No image transformation occurs.
- **Logging**: Pino structured logging is configured via `pino-http`.

## Known Issues / Seeded Behavior
- Multer is intentionally configured with an 8 MiB limit (`limits: { fileSize: 8 * 1024 * 1024 }`).
- An unhandled error mapping defect converts `MulterError: LIMIT_FILE_SIZE` into an `HTTP 500` error with body `{ "error": "INTERNAL_ERROR", "message": "An internal error occurred processing your request" }`.
- When the web frontend receives a 5xx response during photo upload, it redirects the browser to `/?uploadFailed=1`.
- **Note**: Preserving this seeded defect is required in the initial main codebase.

## Verification Commands
- `npm run fixtures` -> Regenerate deterministic test fixtures in `fixtures/`.
- `npm test` -> Execute Vitest unit and API integration tests.
- `npm run test:e2e` -> Execute Playwright browser workflows.
