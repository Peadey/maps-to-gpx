const express = require('express');
const puppeteer = require('puppeteer');
const polyline = require('@mapbox/polyline');
const app = express();
app.use(express.json());

app.post('/api/gpx', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('google.com/maps/dir')) {
    return res.status(400).send('Ungültige URL.');
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.APP_INITIALIZATION_STATE, { timeout: 15000 });

  const points = await page.evaluate(() => {
    const raw = JSON.stringify(window.APP_INITIALIZATION_STATE);
    const match = raw.match(/"points":"([^"]+)"/);
    return match ? match[1] : null;
  });

  await browser.close();
  if (!points) return res.status(500).send('Keine Route gefunden.');

  const coords = polyline.decode(points);
  const gpx =
    `<?xml version="1.0"?>\n<gpx version="1.1" creator="maps-to-gpx">\n` +
    `<trk><name>Google Maps Route</name><trkseg>\n` +
    coords.map(c => `  <trkpt lat="${c[0]}" lon="${c[1]}"/>`).join('\n') +
    `\n</trkseg></trk>\n</gpx>`;

  res.setHeader('Content-Type', 'application/gpx+xml');
  res.setHeader('Content-Disposition', 'attachment; filename="route.gpx"');
  res.send(gpx);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));