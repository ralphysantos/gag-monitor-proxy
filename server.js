const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Manually set CORS headers (for full control)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ralphysantos.github.io');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Gag Monitor Proxy is running',
    endpoint: '/scrape',
    timestamp: new Date().toISOString()
  });
});
// POST endpoint to scrape external page
app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL in request body' });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    res.json({ html });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch target URL', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
