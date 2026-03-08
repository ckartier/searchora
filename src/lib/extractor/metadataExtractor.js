/**
 * Metadata Extractor — title, meta description, OG, canonical, robots, schema, language
 */

/**
 * Extract all page metadata from a Cheerio document
 */
export function extractMetadata($) {
    return {
        title: extractTitle($),
        metaDescription: extractMetaDescription($),
        canonical: extractCanonical($),
        robots: extractRobotsMeta($),
        ogTitle: extractOgTag($, 'og:title'),
        ogDescription: extractOgTag($, 'og:description'),
        ogType: extractOgTag($, 'og:type'),
        ogImage: extractOgTag($, 'og:image'),
        language: extractLanguage($),
        schemaTypes: extractSchemaTypes($),
        schemaData: extractSchemaData($),
    };
}

function extractTitle($) {
    // Prefer og:title, then <title>
    const title = $('title').first().text().trim();
    return title || null;
}

function extractMetaDescription($) {
    const desc =
        $('meta[name="description"]').attr('content') ||
        $('meta[property="description"]').attr('content');
    return desc?.trim() || null;
}

function extractCanonical($) {
    return $('link[rel="canonical"]').attr('href')?.trim() || null;
}

function extractRobotsMeta($) {
    const robots = $('meta[name="robots"]').attr('content');
    return robots?.trim() || null;
}

function extractOgTag($, property) {
    return $(`meta[property="${property}"]`).attr('content')?.trim() || null;
}

function extractLanguage($) {
    return $('html').attr('lang')?.trim() || null;
}

/**
 * Extract JSON-LD schema types from the page
 */
function extractSchemaTypes($) {
    const types = new Set();

    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const data = JSON.parse($(el).html());
            collectSchemaTypes(data, types);
        } catch {
            // Invalid JSON-LD, skip
        }
    });

    return Array.from(types);
}

function collectSchemaTypes(data, types) {
    if (!data) return;

    if (Array.isArray(data)) {
        data.forEach((item) => collectSchemaTypes(item, types));
        return;
    }

    if (typeof data === 'object') {
        if (data['@type']) {
            const t = data['@type'];
            if (Array.isArray(t)) {
                t.forEach((type) => types.add(type));
            } else {
                types.add(t);
            }
        }

        // Check @graph
        if (data['@graph']) {
            collectSchemaTypes(data['@graph'], types);
        }
    }
}

/**
 * Extract full JSON-LD schema data (limited to prevent huge payloads)
 */
function extractSchemaData($) {
    const schemas = [];

    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const data = JSON.parse($(el).html());
            schemas.push(data);
        } catch {
            // skip
        }
    });

    // Limit total schema size
    const jsonStr = JSON.stringify(schemas);
    if (jsonStr.length > 50000) {
        return schemas.slice(0, 2); // Truncate to first 2 schemas
    }

    return schemas;
}
