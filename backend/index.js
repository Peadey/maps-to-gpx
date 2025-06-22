/* index.js — Volles GPX mit Filter, Swap, Waypoints und Metadata */

const express   = require('express');
const cors      = require('cors');
const puppeteer = require('puppeteer');
const { extractRouteData } = require('./parse');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const delay = ms => new Promise(r => setTimeout(r, ms));

app.post('/api/gpx', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('google.com/maps/dir')) {
    return res.status(400).send('Ungültige URL: ' + url);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/127 Safari/537.36'
    );

    console.log('➡️ Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // Consent wegklicken
    try {
      await page.waitForSelector(
          'form[action*="consent"] button, div[role="button"][id*=accept]',
          { timeout: 5000 }
      );
      await page.click(
          'form[action*="consent"] button, div[role="button"][id*=accept]'
      );
      console.log('✅ Consent clicked');
      await delay(800);
    } catch {}

    await delay(1500);

    let coords = await extractRouteData(page);
    await browser.close();

    // Erste doppelte Koordinaten (Start/Ziel in Metadaten) entfernen
    if (coords.length > 4) {
      coords = coords.slice(4);
    }

    // Doppelte aufeinanderfolgende Punkte entfernen
    coords = coords.filter(
        (pt, i) => i === 0 || pt[0] !== coords[i - 1][0] || pt[1] !== coords[i - 1][1]
    );

    if (!coords.length) {
      console.warn('⚠️  No valid geo coordinates');
      return res.status(500).send('Konnte Route nicht extrahieren.');
    }

    // Start- und Zielpunkt
    const [lat1, lon1] = coords[0];
    const [lat2, lon2] = coords[coords.length - 1];
    const now = new Date().toISOString();

    // GPX zusammenbauen
    const gpx = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<gpx
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
    http://www.topografix.com/GPX/1/1
    http://www.topografix.com/GPX/1/1/gpx.xsd
    http://www.garmin.com/xmlschemas/GpxExtensions/v3
    http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd
    http://www.garmin.com/xmlschemas/TrackPointExtension/v1
    http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd
  "
  creator="maps-to-gpx"
  version="1.1"
>
  <metadata>
    <link href="https://github.com/DeinRepo/maps-to-gpx">
      <text>maps-to-gpx</text>
    </link>
    <time>${now}</time>
  </metadata>

  <wpt lat="${lat1}" lon="${lon1}">
    <name>Start</name>
  </wpt>
  <wpt lat="${lat2}" lon="${lon2}">
    <name>Ziel</name>
  </wpt>

  <trk>
    <name>Converted Google Route</name>
    <trkseg>
${coords
        .map(([lat, lon], i) =>
            `      <trkpt lat="${lat}" lon="${lon}">
        <name>TP${String(i + 1).padStart(3, '0')}</name>
      </trkpt>`
        )
        .join('\n')}
    </trkseg>
  </trk>
</gpx>`;

    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename="route.gpx"'
    );
    res.send(gpx);

  } catch (err) {
    console.error('❌ Error processing route:', err);
    await browser.close();
    res.status(500).send('Fehler beim Verarbeiten der Route.');
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
