const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

process.env.JWT_SECRET = 'testsecret';

jest.mock('../models/User');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'mockedId123',
      name: 'Test User',
      email: 'test@example.com'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.name).toEqual('Test User');
  });

  it('should not register user with existing email', async () => {
    User.findOne.mockResolvedValue({ email: 'existing@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test',
        email: 'existing@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(400);
  });
});
