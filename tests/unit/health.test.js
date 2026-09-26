const request = require('supertest');
const app = require('../../src/app');

describe('GET /healthz', () => {
  it('should return 200 OK with app status and version 2.3.1', async () => {
    const response = await request(app).get('/healthz');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('version', '2.3.1');
    expect(response.body).toHaveProperty('uptime');
  });
});
