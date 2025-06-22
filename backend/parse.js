// parse.js
// Exports a function to extract route coordinates from a Google Maps “/maps/preview/directions” script block.

module.exports = {
    /**
     * Extrahiert alle [lat, lon]-Paare aus dem JSON-Payload der
     * "/maps/preview/directions" Anfrage, die im DOM als <script>-Tag eingebettet ist.
     * @param {import('puppeteer').Page} page
     * @returns {Promise<Array<[number, number]>>} Liste von [lat, lon]
     */
    extractRouteData: async function(page) {
        console.log('[parser] Starte Route-Extraktion');
        // 1) Suche im DOM nach dem Script, das die Daten in
        //    window.APP_INITIALIZATION_STATE enthält
        const dataStr = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script'));
            for (const script of scripts) {
                const text = script.textContent || '';
                if (text.includes('APP_INITIALIZATION_STATE')) {
                    const m = text.match(/APP_INITIALIZATION_STATE=([^;]+);/s);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
            return null;
        });

        if (!dataStr) {
            return [];
        }

        // 2) Extrahiere alle Lat/Lon-Paare mittels Regex aus dem
        //    JSON-String. Einige Zahlen sind durch Zeilenumbrüche
        //    getrennt, daher entfernen wir diese vorher.
        const cleaned = dataStr.replace(/\n/g, '');
        const coordRe = /(-?\d+\.\d+),(-?\d+\.\d+)/g;
        const coords = [];
        let m;
        while ((m = coordRe.exec(cleaned)) !== null) {
            let a = parseFloat(m[1]);
            let b = parseFloat(m[2]);
            if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
                coords.push([a, b]);
            } else if (Math.abs(b) <= 90 && Math.abs(a) <= 180) {
                coords.push([b, a]);
            }
        }
        console.log(`[parser] Extrahierte Koordinaten-Paare: ${coords.length}`);

        return coords;
    }
};
