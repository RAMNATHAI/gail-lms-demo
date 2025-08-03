import express from 'express';
import { User } from '../models/User';

const router = express.Router();

// Get current user profile
router.get('/profile', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
});

// Get all users (admin only)
router.get('/', async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const users = await User.find({ isActive: true });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

export default router;
