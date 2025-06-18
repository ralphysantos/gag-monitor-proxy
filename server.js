const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Manually set CORS headers (for full control)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin','*');
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
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing URL in request body.' });
    }

    const response = await fetch(url,{  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'text/html'
  }});

    if (!response.ok) {
      return res.status(502).json({
        error: 'Failed to fetch the target URL',
        status: response.status,
        statusText: response.statusText
      });
    }

    const html = await response.text();
    res.status(200).json({ html });

  } catch (err) {
    console.error('Scrape Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
