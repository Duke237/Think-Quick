const request = require('supertest');
const app = require('../src/index'); // Adjust if necessary
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Game Controller', () => {
  it('should create a new game', async () => {
    const response = await request(app).post('/api/games').send({});
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  // Add more tests for other endpoints
});0