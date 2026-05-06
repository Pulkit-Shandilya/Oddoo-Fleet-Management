const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API proxy for backend requests (optional, for convenience)
app.use('/api', (req, res, next) => {
  // This allows frontend fetch calls to /api/* to be proxied to the backend
  // You can implement this if needed, or remove if not using
  next();
});

// Serve index.html for any unmatched routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Tracktable Frontend Server Started       ║
╠════════════════════════════════════════╣
║   URL: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
╚════════════════════════════════════════╝
  `);
});
