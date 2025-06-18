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
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing URL in request body.' });
  }
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();
    res.status(200).json({ html: content });
  } catch (err) {
    console.error('Scrape Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
