# Maps to GPX

## Backend (Node.js + Puppeteer)

1. Clone das Repository.
2. Deployment z. B. über [Railway](https://railway.app):
   - Neues Projekt → GitHub Repo verbinden → Ordner `backend` auswählen.
3. Nach dem Deployment bekommst du eine URL wie `https://your-app.up.railway.app/api/gpx`

## Frontend (PHP PWA)

1. Lade den Inhalt des Ordners `frontend/` auf deinen IONOS Webspace hoch.
2. In `index.php` die URL zum Backend einsetzen (`$backend = '...'`)
3. App auf Handy öffnen und installieren als PWA.

Fertig.