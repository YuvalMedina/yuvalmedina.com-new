// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve static files first
app.use(express.static(path.join(__dirname, 'public')));

// 2. Explicitly serve /works/index.html
app.get('/works/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'works', 'index.html'));
});

// 3. Clean URL handler for individual works, but exclude actual files like .json or .html
app.get('/works/:slug', (req, res) => {
  const slug = req.params.slug;

  // Avoid hijacking real files like JSON or HTML
  if (slug.includes('.')) {
    return;
  }

  res.sendFile(path.join(__dirname, 'public', 'works', 'individual-work-template.html'));
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
