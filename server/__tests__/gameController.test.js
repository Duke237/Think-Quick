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
  it('should create a new game with a code and waiting status', async () => {
    const response = await request(app).post('/api/games').send({});
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('code');
    expect(typeof response.body.code).toBe('string');
    expect(response.body.status).toBe('waiting');
  });

  it('should allow a player to join an existing game by code', async () => {
    // create a game first
    const createRes = await request(app).post('/api/games').send({});
    expect(createRes.status).toBe(201);
    const { code, _id } = createRes.body;

    const joinRes = await request(app).post('/api/games/join').send({ code, name: 'Alice' });
    expect(joinRes.status).toBe(200);
    expect(joinRes.body).toHaveProperty('gameId');
    expect(joinRes.body).toHaveProperty('player');
    expect(joinRes.body.player).toHaveProperty('playerId');
    expect(joinRes.body.player.name).toBe('Alice');

    // verify player saved in DB
    const getRes = await request(app).get(`/api/games/${_id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.players.some((p) => p.name === 'Alice')).toBe(true);
  });

  // Add more tests for other endpoints
});