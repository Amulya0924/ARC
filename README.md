# arc-debug-photo-demo

Version: 2.3.1

A photo upload and serving web application built with Node.js 22, Express 5, Multer 2, Pino structured logging, Vitest, and Playwright.

## Features

- Photo upload interface at `/`
- Binary storage in `.data/photos` using SHA-256 hash as photo ID
- Endpoints:
  - `GET /healthz`: Health status and app version (`2.3.1`)
  - `POST /api/photos`: Upload photo (multipart field `photo`)
  - `GET /api/photos/:id`: Retrieve metadata of uploaded photo
  - `GET /api/photos/:id/content`: Retrieve exact binary content of photo
- Structured JSON logging with Pino
- Fixtures generator producing deterministic test images and `manifest.json`

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation & Setup

```bash
# Install dependencies
npm install

# Generate fixtures
npm run fixtures

# Start development server
npm run dev

# Start production server
npm start
```

### Running Tests

```bash
# Unit & API tests (Vitest + Supertest)
npm test

# End-to-End browser tests (Playwright)
npm run test:e2e
```

### Docker

```bash
docker build -t arc-debug-photo-demo .
docker run -p 3000:3000 arc-debug-photo-demo
```
