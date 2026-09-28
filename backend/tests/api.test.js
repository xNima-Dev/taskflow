const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');

process.env.JWT_SECRET = 'testsecret';

jest.mock('../models/User');
jest.mock('../models/Workspace');
jest.mock('../models/Project');
jest.mock('../models/Task');

describe('TaskFlow Comprehensive API & Security Tests', () => {
  const userA = { _id: '507f1f77bcf86cd799439011', name: 'Alice', email: 'alice@example.com' };
  const userB = { _id: '507f1f77bcf86cd799439012', name: 'Bob', email: 'bob@example.com' };

  const tokenUserA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET);
  const tokenUserB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Error Handling & Status Codes', () => {
    it('should return HTTP 500 (not 200) on unhandled server error', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(userA)
      });
      Workspace.find = jest.fn().mockImplementation(() => {
        throw new Error('Database connection dropped unexpectedly');
      });

      const res = await request(app)
        .get('/api/workspaces')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Database connection dropped unexpectedly');
    });

    it('should return HTTP 400 (not 200) on Mongoose CastError (invalid ObjectId)', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(userA)
      });
      const castError = new Error('Cast to ObjectId failed for value "invalid-id"');
      castError.name = 'CastError';
      Workspace.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(castError)
        })
      });

      const res = await request(app)
        .get('/api/workspaces/invalid-id')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/cast to objectid failed/i);
    });

    it('should return HTTP 401 when accessing protected route without token', async () => {
      const res = await request(app).get('/api/workspaces');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/not authorized/i);
    });
  });

  describe('2. Multi-tenancy & Authorization Isolation', () => {
    it('should deny User B from viewing tasks of User A’s project (Tenant Isolation)', async () => {
      // Mock User.findById for User B
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(userB)
      });

      // Project belongs to Workspace A
      const projectA = {
        _id: '607f1f77bcf86cd799439021',
        name: 'Secret Project A',
        workspace: '707f1f77bcf86cd799439031'
      };
      Project.findById = jest.fn().mockResolvedValue(projectA);

      // Workspace A only has User A as member
      Workspace.findOne = jest.fn().mockResolvedValue(null); // User B is NOT in workspace

      const res = await request(app)
        .get(`/api/tasks/project/${projectA._id}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('should allow User A to view tasks in their own project', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(userA)
      });

      const projectA = {
        _id: '607f1f77bcf86cd799439021',
        name: 'Project A',
        workspace: '707f1f77bcf86cd799439031'
      };
      Project.findById = jest.fn().mockResolvedValue(projectA);
      Workspace.findOne = jest.fn().mockResolvedValue({ _id: projectA.workspace });

      const mockTasks = [
        { _id: 'task1', title: 'Task 1', status: 'todo', project: projectA._id }
      ];
      Task.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTasks)
      });

      const res = await request(app)
        .get(`/api/tasks/project/${projectA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Task 1');
    });
  });

  describe('3. Mass-Assignment Vulnerability Protection', () => {
    it('should only update whitelisted fields and ignore attempts to reassign project ID', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(userA)
      });

      const existingTask = {
        _id: 'task123',
        title: 'Original Title',
        project: 'projectOriginalId'
      };
      Task.findById = jest.fn().mockResolvedValue(existingTask);
      Project.findById = jest.fn().mockResolvedValue({ _id: 'projectOriginalId', workspace: 'ws1' });
      Workspace.findOne = jest.fn().mockResolvedValue({ _id: 'ws1' });

      // Mock update
      Task.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'task123',
          title: 'Updated Title',
          project: 'projectOriginalId' // Should remain projectOriginalId
        })
      });

      const res = await request(app)
        .put('/api/tasks/task123')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Updated Title',
          project: 'maliciousAttackerProjectId' // Attempting mass assignment
        });

      expect(res.statusCode).toBe(200);
      // Verify findByIdAndUpdate was called with whitelisted fields only, NOT with malicious project ID
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
        'task123',
        expect.not.objectContaining({ project: 'maliciousAttackerProjectId' }),
        expect.objectContaining({ new: true, runValidators: true })
      );
    });
  });

  describe('4. RBAC (Role-Based Access Control)', () => {
    it('should deny non-admin member from inviting new members', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(userB)
      });

      const workspace = {
        _id: 'ws1',
        name: 'Workspace Alpha',
        owner: userA._id,
        members: [
          { user: userA._id, role: 'admin' },
          { user: userB._id, role: 'member' } // User B is only a member
        ]
      };
      Workspace.findById = jest.fn().mockResolvedValue(workspace);

      const res = await request(app)
        .post('/api/workspaces/ws1/members')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({
          email: 'newuser@example.com',
          role: 'member'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/only workspace admins/i);
    });
  });
});
