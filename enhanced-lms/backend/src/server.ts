import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});

// CORS configuration - More permissive for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // For legacy browser support
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicit OPTIONS handler for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development',
  });
});

// Simple API Routes
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Introduction to GAIL Operations',
        description: 'Learn the basics of GAIL operations and safety protocols',
        category: 'Operations',
        difficulty: 'beginner',
        estimatedDuration: 4,
        isMandatory: true,
      },
      {
        id: '2',
        title: 'Advanced Safety Procedures',
        description: 'Advanced safety protocols for GAIL employees',
        category: 'Safety & Compliance',
        difficulty: 'intermediate',
        estimatedDuration: 6,
        isMandatory: true,
      },
    ],
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Demo authentication
  if (email === 'admin@gail.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'admin@gail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          department: 'Information Technology',
        },
        token: 'demo-jwt-token',
      },
    });
  } else if (email === 'learner@gail.com' && password === 'learner123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '2',
          email: 'learner@gail.com',
          firstName: 'Learner',
          lastName: 'User',
          role: 'learner',
          department: 'Operations',
        },
        token: 'demo-jwt-token',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const port = process.env.PORT || 9999;
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🚀 Server running on http://127.0.0.1:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📊 Health check: http://127.0.0.1:${port}/health`);
  console.log(`🌐 Listening on all interfaces (0.0.0.0:${port})`);
});

export { app, io };
