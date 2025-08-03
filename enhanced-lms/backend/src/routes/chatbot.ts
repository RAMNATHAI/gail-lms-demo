import express from 'express';
const router = express.Router();

router.post('/chat', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      message: 'Hello! I am your AI assistant. How can I help you with the GAIL LMS today?' 
    } 
  });
});

export default router;
