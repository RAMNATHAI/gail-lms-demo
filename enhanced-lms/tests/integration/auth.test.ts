import request from 'supertest';
import { app } from '../../backend/src/server';
import { User } from '../../backend/src/models/User';
import { connectTestDatabase, clearTestDatabase, closeTestDatabase } from '../utils/testDb';

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('TC-001: User Login', () => {
    beforeEach(async () => {
      // Create test user
      const testUser = new User({
        email: 'test@gail.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        employeeId: 'EMP001',
        department: 'Information Technology',
        role: 'learner',
      });
      await testUser.save();
    });

    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toMatchObject({
        email: 'test@gail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'learner',
      });
      expect(response.body.data.token).toBeDefined();
    });

    it('should update last login timestamp on successful login', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'password123',
        })
        .expect(200);

      const user = await User.findOne({ email: 'test@gail.com' });
      expect(user?.lastLogin).toBeDefined();
      expect(user?.lastLogin).toBeInstanceOf(Date);
    });

    it('should reset failed login attempts on successful login', async () => {
      // First, create a user with failed attempts
      const user = await User.findOne({ email: 'test@gail.com' });
      if (user) {
        user.failedLoginAttempts = 3;
        await user.save();
      }

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'password123',
        })
        .expect(200);

      const updatedUser = await User.findOne({ email: 'test@gail.com' });
      expect(updatedUser?.failedLoginAttempts).toBe(0);
    });
  });

  describe('TC-002: Invalid Login', () => {
    beforeEach(async () => {
      const testUser = new User({
        email: 'test@gail.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        employeeId: 'EMP001',
        department: 'Information Technology',
        role: 'learner',
      });
      await testUser.save();
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@gail.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should increment failed login attempts on invalid password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'wrongpassword',
        })
        .expect(401);

      const user = await User.findOne({ email: 'test@gail.com' });
      expect(user?.failedLoginAttempts).toBe(1);
      expect(user?.lastFailedLogin).toBeDefined();
    });

    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@gail.com',
            password: 'wrongpassword',
          })
          .expect(401);
      }

      const user = await User.findOne({ email: 'test@gail.com' });
      expect(user?.accountLocked).toBe(true);
      expect(user?.lockUntil).toBeDefined();
      expect(user?.failedLoginAttempts).toBe(5);
    });

    it('should reject login for locked account', async () => {
      // Lock the account
      const user = await User.findOne({ email: 'test@gail.com' });
      if (user) {
        user.accountLocked = true;
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'password123',
        })
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('temporarily locked');
    });

    it('should reject login for inactive user', async () => {
      // Deactivate the user
      const user = await User.findOne({ email: 'test@gail.com' });
      if (user) {
        user.isActive = false;
        await user.save();
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Please provide a valid email address',
          }),
        ])
      );
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password must be at least 6 characters long',
          }),
        ])
      );
    });
  });

  describe('TC-003: Admin Role Access', () => {
    beforeEach(async () => {
      // Create admin user
      const adminUser = new User({
        email: 'admin@gail.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        employeeId: 'ADM001',
        department: 'Information Technology',
        role: 'admin',
      });
      await adminUser.save();

      // Create regular user
      const regularUser = new User({
        email: 'user@gail.com',
        password: 'user123',
        firstName: 'Regular',
        lastName: 'User',
        employeeId: 'USR001',
        department: 'Operations',
        role: 'learner',
      });
      await regularUser.save();
    });

    it('should return admin role in login response for admin user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@gail.com',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body.data.user.role).toBe('admin');
    });

    it('should return learner role in login response for regular user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@gail.com',
          password: 'user123',
        })
        .expect(200);

      expect(response.body.data.user.role).toBe('learner');
    });

    it('should include role in JWT token payload', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@gail.com',
          password: 'admin123',
        })
        .expect(200);

      const token = response.body.data.token;
      expect(token).toBeDefined();

      // Decode token to verify role is included
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      expect(decoded.role).toBe('admin');
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(async () => {
      const testUser = new User({
        email: 'test@gail.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        employeeId: 'EMP001',
        department: 'Information Technology',
        role: 'learner',
      });
      await testUser.save();
    });

    it('should apply rate limiting after multiple failed attempts', async () => {
      // Make multiple rapid requests
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@gail.com',
            password: 'wrongpassword',
          })
      );

      const responses = await Promise.all(requests);
      
      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('Logout', () => {
    let authToken: string;

    beforeEach(async () => {
      const testUser = new User({
        email: 'test@gail.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        employeeId: 'EMP001',
        department: 'Information Technology',
        role: 'learner',
      });
      await testUser.save();

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gail.com',
          password: 'password123',
        });

      authToken = loginResponse.body.data.token;
    });

    it('should successfully logout with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
