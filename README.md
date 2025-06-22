# Maps to GPX

## Backend (Node.js + Puppeteer)

### Deployment auf Render.com (kostenlos)

1. Gehe zu [https://render.com](https://render.com)
2. Logge dich mit GitHub ein
3. Klicke auf "New Web Service"
4. Wähle dein Repository aus
5. Stelle ein:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Free Plan:** aktivieren
6. Nach dem Deployment bekommst du eine URL wie:
   `https://maps-to-gpx.onrender.com/api/gpx`

### Frontend (PHP PWA)

1. Lade den Inhalt des Ordners `frontend/` auf deinen IONOS-Webspace hoch.
2. In `index.php` die Render-URL im `$backend`-Feld einsetzen.
3. Rufe die Seite auf, gib einen Google Maps Link ein, lade das GPX.
4. Installierbar als PWA auf dem Handy.