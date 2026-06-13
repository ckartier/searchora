// Data cleaning: trims strings, strips HTML tags and control characters,
// drops unknown fields, and normalizes the audit into a predictable shape.

const TAG_RE = /<[^>]*>/g;
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0008\u000b-\u001f\u007f]/g;

export function cleanText(value, maxLength = 2000) {
    if (typeof value !== 'string') return '';
    return value.replace(TAG_RE, '').replace(CONTROL_RE, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function cleanMultiline(value, maxLength = 4000) {
    if (typeof value !== 'string') return '';
    return value
        .replace(TAG_RE, '')
        .replace(CONTROL_RE, '')
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, maxLength);
}

export function cleanUrl(value) {
    if (typeof value !== 'string') return '';
    try {
        const url = new URL(value.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
        return url.toString();
    } catch {
        return '';
    }
}

function cleanStringArray(values, maxItems = 50) {
    if (!Array.isArray(values)) return [];
    return values.map((v) => cleanText(v, 200)).filter(Boolean).slice(0, maxItems);
}

export function sanitizeAudit(data) {
    const company = data.company || {};
    const founder = company.founder || {};
    const address = company.address || {};

    return {
        generatedAt: new Date().toISOString(),
        geoScore: data.geoScore !== undefined ? Math.round(Number(data.geoScore)) : null,
        company: {
            name: cleanText(company.name, 200),
            legalName: cleanText(company.legalName, 200),
            url: cleanUrl(company.url),
            logo: cleanUrl(company.logo),
            description: cleanMultiline(company.description, 1500),
            email: cleanText(company.email, 200),
            phone: cleanText(company.phone, 50),
            industry: cleanText(company.industry, 200),
            languages: cleanStringArray(company.languages, 10),
            social: (Array.isArray(company.social) ? company.social : []).map(cleanUrl).filter(Boolean).slice(0, 20),
            founder: founder.name
                ? { name: cleanText(founder.name, 200), title: cleanText(founder.title, 200) }
                : null,
            address: address.city || address.street
                ? {
                      street: cleanText(address.street, 300),
                      city: cleanText(address.city, 100),
                      zip: cleanText(address.zip, 20),
                      country: cleanText(address.country, 100),
                  }
                : null,
        },
        services: (Array.isArray(data.services) ? data.services : [])
            .map((s) =>
                typeof s === 'string'
                    ? { name: cleanText(s, 200), description: '' }
                    : { name: cleanText(s?.name, 200), description: cleanText(s?.description, 600) }
            )
            .filter((s) => s.name)
            .slice(0, 30),
        faq: (Array.isArray(data.faq) ? data.faq : [])
            .map((f) => ({ question: cleanText(f?.question, 400), answer: cleanMultiline(f?.answer, 2000) }))
            .filter((f) => f.question && f.answer)
            .slice(0, 50),
        pages: (Array.isArray(data.pages) ? data.pages : [])
            .map((p) => ({
                url: cleanUrl(p?.url),
                title: cleanText(p?.title, 300),
                description: cleanText(p?.description, 500),
            }))
            .filter((p) => p.url)
            .slice(0, 100),
        keywords: cleanStringArray(data.keywords, 50),
    };
}
