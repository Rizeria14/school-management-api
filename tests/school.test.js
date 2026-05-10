

const request = require('supertest');


const mockExecute = jest.fn();
jest.mock('../src/config/db', () => ({
  pool: { execute: mockExecute },
  testConnection: jest.fn().mockResolvedValue(true),
}));

const app = require('../src/app');


describe('Haversine Distance Utility', () => {
  const { haversineDistance } = require('../src/utils/distance');

  test('distance between same point is 0', () => {
    expect(haversineDistance(0, 0, 0, 0)).toBe(0);
  });

  test('distance between London and Paris is ~340 km', () => {
    const dist = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(dist).toBeGreaterThan(330);
    expect(dist).toBeLessThan(350);
  });

  test('distance is symmetric', () => {
    const d1 = haversineDistance(28.6139, 77.2090, 19.0760, 72.8777);
    const d2 = haversineDistance(19.0760, 72.8777, 28.6139, 77.2090);
    expect(d1).toBe(d2);
  });
});


describe('POST /addSchool', () => {
  beforeEach(() => mockExecute.mockReset());

  const validPayload = {
    name: 'Springfield Elementary',
    address: '123 Main Street, Springfield',
    latitude: 28.6139,
    longitude: 77.209,
  };

  test('201 – successfully adds a school', async () => {

    mockExecute
      .mockResolvedValueOnce([[]])              // findDuplicate
      .mockResolvedValueOnce([{ insertId: 1 }]); // create

    const res = await request(app).post('/addSchool').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ id: 1, name: 'Springfield Elementary' });
  });

  test('422 – missing required fields', async () => {
    const res = await request(app).post('/addSchool').send({ name: 'Only Name' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('422 – invalid latitude out of range', async () => {
    const res = await request(app)
      .post('/addSchool')
      .send({ ...validPayload, latitude: 999 });
    expect(res.status).toBe(422);
  });

  test('422 – invalid longitude out of range', async () => {
    const res = await request(app)
      .post('/addSchool')
      .send({ ...validPayload, longitude: -200 });
    expect(res.status).toBe(422);
  });

  test('409 – duplicate school', async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 5 }]]); // findDuplicate finds a match
    const res = await request(app).post('/addSchool').send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('422 – name too short', async () => {
    const res = await request(app)
      .post('/addSchool')
      .send({ ...validPayload, name: 'A' });
    expect(res.status).toBe(422);
  });
});


describe('GET /listSchools', () => {
  beforeEach(() => mockExecute.mockReset());

  const schools = [
    { id: 1, name: 'School A', address: 'Addr A', latitude: 28.7041, longitude: 77.1025 },
    { id: 2, name: 'School B', address: 'Addr B', latitude: 19.076,  longitude: 72.8777 },
    { id: 3, name: 'School C', address: 'Addr C', latitude: 12.9716, longitude: 77.5946 },
  ];

  test('200 – returns schools sorted by proximity', async () => {
    mockExecute.mockResolvedValueOnce([schools]);


    const res = await request(app)
      .get('/listSchools')
      .query({ latitude: 28.6139, longitude: 77.209 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(3);

    expect(res.body.data[0].name).toBe('School A');

    res.body.data.forEach((s) => expect(s.distance_km).toBeDefined());
  });

  test('200 – empty list when no schools in DB', async () => {
    mockExecute.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .get('/listSchools')
      .query({ latitude: 28.6139, longitude: 77.209 });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('422 – missing latitude', async () => {
    const res = await request(app).get('/listSchools').query({ longitude: 77.209 });
    expect(res.status).toBe(422);
  });

  test('422 – missing longitude', async () => {
    const res = await request(app).get('/listSchools').query({ latitude: 28.6139 });
    expect(res.status).toBe(422);
  });

  test('422 – latitude not a number', async () => {
    const res = await request(app)
      .get('/listSchools')
      .query({ latitude: 'abc', longitude: 77.209 });
    expect(res.status).toBe(422);
  });

  test('meta contains userLocation', async () => {
    mockExecute.mockResolvedValueOnce([schools]);
    const res = await request(app)
      .get('/listSchools')
      .query({ latitude: 28.6139, longitude: 77.209 });
    expect(res.body.meta.userLocation).toEqual({ latitude: 28.6139, longitude: 77.209 });
  });
});


describe('404 Handler', () => {
  test('unknown route returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
