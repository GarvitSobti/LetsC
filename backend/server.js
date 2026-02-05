// Simple Node.js server for Team LetsC Hackathon Project
// Uncomment and modify based on your needs

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Example API endpoint
app.get('/api/data', (req, res) => {
  res.json({ 
    message: 'Hello from Team LetsC!',
    data: []
  });
});

// POST example
app.post('/api/data', (req, res) => {
  const data = req.body;
  console.log('Received data:', data);
  res.json({ 
    success: true, 
    message: 'Data received successfully',
    data: data
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ${path.join(__dirname, '../frontend')}`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
