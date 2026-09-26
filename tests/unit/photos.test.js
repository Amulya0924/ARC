const request = require('supertest');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = require('../../src/app');

describe('Photos API Endpoints', () => {
  const smallPath = path.join(process.cwd(), 'fixtures', 'small-detailed.png');
  const largePath = path.join(process.cwd(), 'fixtures', 'large-noisy.png');

  let smallBuffer;
  let smallSha256;
  let uploadedId;

  beforeAll(() => {
    if (!fs.existsSync(smallPath) || !fs.existsSync(largePath)) {
      throw new Error('Test fixtures missing. Run "npm run fixtures" first.');
    }
    smallBuffer = fs.readFileSync(smallPath);
    smallSha256 = crypto.createHash('sha256').update(smallBuffer).digest('hex');
  });

  it('should upload a normal photo (< 8 MiB) and return 201 Created with photo ID equal to SHA-256', async () => {
    const res = await request(app)
      .post('/api/photos')
      .attach('photo', smallPath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', smallSha256);
    expect(res.body).toHaveProperty('size', smallBuffer.length);
    expect(res.body).toHaveProperty('mimeType', 'image/png');
    uploadedId = res.body.id;
  });

  it('should retrieve photo metadata via GET /api/photos/:id', async () => {
    const res = await request(app).get(`/api/photos/${uploadedId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', uploadedId);
    expect(res.body).toHaveProperty('size', smallBuffer.length);
  });

  it('should retrieve exact byte-identical photo content via GET /api/photos/:id/content', async () => {
    const res = await request(app)
      .get(`/api/photos/${uploadedId}/content`)
      .responseType('blob');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('image/png');

    const downloadedBuffer = Buffer.from(res.body);
    const downloadedSha256 = crypto.createHash('sha256').update(downloadedBuffer).digest('hex');

    expect(downloadedBuffer.length).toBe(smallBuffer.length);
    expect(downloadedSha256).toBe(smallSha256);
    expect(downloadedBuffer.equals(smallBuffer)).toBe(true);
  });

  it('should return 400 Bad Request when photo field is missing', async () => {
    const res = await request(app)
      .post('/api/photos')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'BAD_REQUEST');
  });

  it('should return 404 Not Found for unknown photo ID', async () => {
    const res = await request(app).get('/api/photos/0000000000000000000000000000000000000000000000000000000000000000');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'NOT_FOUND');
  });

  it('should return seeded 500 INTERNAL_ERROR when uploading photo > 8 MiB (seeded defect)', async () => {
    const res = await request(app)
      .post('/api/photos')
      .attach('photo', largePath);

    // Seeded defect: Multer limit triggers error, error handler converts to 500
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'INTERNAL_ERROR');
    expect(res.body).toHaveProperty('message', 'An internal error occurred processing your request');
  });
});
