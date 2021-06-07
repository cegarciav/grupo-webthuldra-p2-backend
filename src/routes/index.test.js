const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('GET /', () => {
  test('responds correctly', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type'])
      .toBe('application/json; charset=utf-8');
    const content = JSON.parse(response.text);
    expect(content.appVersion).toBe('1.0.0');
  });
});
