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
        // 1) Suche im DOM nach dem Script, das die directions-JSON enthält
        const jsonBlock = await page.evaluate(() => {
            console.log('[parser] Suche Script-Tags nach "/maps/preview/directions"');
            const scripts = Array.from(document.querySelectorAll('script'));
            for (const script of scripts) {
                const text = script.textContent || '';
                if (text.includes('/maps/preview/directions')) {
                    console.log(`[parser] Gefunden in <script> (Länge ${text.length})`);
                    // Regex: fängt das [[[ ... ]]]-Array nach dem fetch(...).then(res=>res.json()=>...)
                    const re = /fetch\("\/maps\/preview\/directions\?[^"]+"\)\s*\.then\(\s*res\s*=>\s*res\.json\(\)\s*=>\s*(\[\[\[[\s\S]*?\]\]\])/m;
                    const m = text.match(re);
                    if (m && m[1]) {
                        console.log(`[parser] JSON-Block gefunden (Länge ${m[1].length})`);
                        return m[1];
                    }
                }
            }
            console.warn('[parser] Kein directions-JSON-Block in Script-Tags gefunden');
            return null;
        });

        if (!jsonBlock) {
            return [];
        }

        // 2) In Node: JSON.parse und Koordinaten extrahieren
        let arr;
        try {
            console.log('[parser] Parsen des JSON-Blocks');
            arr = JSON.parse(jsonBlock);
            console.log('[parser] JSON geparst, top-level Elemente:', arr.length);
        } catch (err) {
            console.error('[parser] Fehler beim JSON.parse:', err);
            return [];
        }

        // 3) Tief durchsuchen und alle [lat, lon]-Paare sammeln
        const coords = [];
        const isLatLon = node =>
            Array.isArray(node) &&
            node.length >= 4 &&
            typeof node[node.length - 2] === 'number' &&
            typeof node[node.length - 1] === 'number';

        function traverse(node) {
            if (isLatLon(node)) {
                const lat = node[node.length - 2];
                const lon = node[node.length - 1];
                coords.push([lat, lon]);
            } else if (Array.isArray(node)) {
                for (const child of node) {
                    traverse(child);
                }
            }
        }
        console.log('[parser] Durchsuche JSON-Struktur nach lat/lon-Paaren');
        traverse(arr);
        console.log(`[parser] Extrahierte Koordinaten-Paare: ${coords.length}`);

        return coords;
    }
};
