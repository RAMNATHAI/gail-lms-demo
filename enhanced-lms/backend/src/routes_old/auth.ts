import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { createAuditLog } from '../utils/auditLog';

const router = express.Router();

// TC-001: User Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// TC-001: User Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    // TC-002: Invalid Login handling
    if (!user) {
      await createAuditLog({
        action: 'LOGIN_FAILED',
        userId: null,
        details: { email, reason: 'User not found' },
        ipAddress: req.ip,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      await createAuditLog({
        action: 'LOGIN_FAILED',
        userId: user._id,
        details: { email, reason: 'Account deactivated' },
        ipAddress: req.ip,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountLocked = true;
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.save();
      
      await createAuditLog({
        action: 'LOGIN_FAILED',
        userId: user._id,
        details: { email, reason: 'Invalid password', attempts: user.failedLoginAttempts },
        ipAddress: req.ip,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.',
      });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastFailedLogin = undefined;
    user.accountLocked = false;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );

    // TC-003: Admin Role Access - Include role in response
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId,
      avatar: user.avatar,
      preferences: user.preferences,
    };

    await createAuditLog({
      action: 'LOGIN_SUCCESS',
      userId: user._id,
      details: { email, role: user.role },
      ipAddress: req.ip,
    });

    logger.info(`User ${user.email} logged in successfully`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // In a production environment, you might want to blacklist the token
      // For now, we'll just log the logout event
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      await createAuditLog({
        action: 'LOGOUT',
        userId: decoded.userId,
        details: { email: decoded.email },
        ipAddress: req.ip,
      });
      
      logger.info(`User ${decoded.email} logged out`);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

// Password reset request
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

    if (user) {
      // Generate reset token and send email
      // Implementation would include email service
      await createAuditLog({
        action: 'PASSWORD_RESET_REQUESTED',
        userId: user._id,
        details: { email },
        ipAddress: req.ip,
      });
    }
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
