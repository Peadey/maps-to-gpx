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

        const scriptText = await page.evaluate(() => {
            const tag = Array.from(document.querySelectorAll('script')).find(s =>
                s.textContent && s.textContent.includes('APP_INITIALIZATION_STATE')
            );
            return tag ? tag.textContent : null;
        });

        if (!scriptText) {
            return [];
        }

        // Der Directions-Payload beginnt nach einem ")]}'" Marker und endet
        // vor "window.WIZ_global_data". Darin suchen wir nach Dezimalpaaren.
        const startIdx = scriptText.indexOf(")]}'");
        let payload = startIdx >= 0 ? scriptText.slice(startIdx + 4) : scriptText;
        const endIdx = payload.indexOf('window.WIZ_global_data');
        if (endIdx > 0) payload = payload.slice(0, endIdx);

        const coordRe = /(-?\d+\.\d+),(-?\d+\.\d+)/g;
        const coords = [];
        let m;
        while ((m = coordRe.exec(payload)) !== null) {
            const a = parseFloat(m[1]);
            const b = parseFloat(m[2]);
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
