const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
let PORT = Number(process.env.PORT) || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from any localhost port, or no origin (like curl)
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev
    }
  },
  credentials: true,
}));

// Middleware to parse JSON
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
      PORT += 1;
      setTimeout(startServer, 100);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer();