const request = require('supertest');
const app = require('../src/index'); // Adjust if necessary
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Seeding', () => {
  it('should seed questions', async () => {
    const response = await request(app).post('/api/admin/questions').send({
      questionId: 1,
      text: 'Sample Question',
      answers: [{ text: 'Answer 1', frequency: 50 }],
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('questionId', 1);
  });
});