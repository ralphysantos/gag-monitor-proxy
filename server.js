const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Manually set CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // You can lock this to https://ralphysantos.github.io if needed
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Server status check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Gag Monitor Proxy is running',
    endpoint: '/scrape',
    timestamp: new Date().toISOString()
  });
});

// Scraping endpoint
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing URL in request body.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch the target URL',
        status: response.status,
        statusText: response.statusText
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const gridItems = $('.grid > div').map((i, el) => $(el).html()).get();

    res.status(200).json({ html: gridItems });

  } catch (err) {
    console.error('Scrape Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
