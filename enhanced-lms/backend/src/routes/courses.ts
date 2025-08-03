import express from 'express';
import { Course } from '../models/Course';

const router = express.Router();

// Get all courses
router.get('/', async (req: any, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
    });
  }
});

// Create new course (admin/instructor only)
router.post('/', async (req: any, res) => {
  try {
    if (!['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const courseData = {
      ...req.body,
      instructor: req.user._id,
      createdBy: req.user._id,
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
    });
  }
});

export default router;
