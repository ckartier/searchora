// Validation of the Searchora audit source file (.geo / .json).
// The file is parsed with JSON.parse only — no code from the file is ever executed.

export const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const HTTP_URL = /^https:\/\/[^\s]+$|^http:\/\/[^\s]+$/;

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

function fail(message) {
    throw new ValidationError(message);
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseAuditFile(raw) {
    if (Buffer.byteLength(raw, 'utf8') > MAX_FILE_SIZE) {
        fail(`Source file exceeds the 1 MB limit.`);
    }
    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        fail(`Source file is not valid JSON: ${err.message}`);
    }
    if (!isPlainObject(data)) {
        fail('Source file must contain a JSON object at the top level.');
    }
    return data;
}

export function validateAudit(data) {
    const company = data.company;
    if (!isPlainObject(company)) {
        fail('Missing required "company" object.');
    }
    if (typeof company.name !== 'string' || !company.name.trim()) {
        fail('Missing required "company.name".');
    }
    if (typeof company.url !== 'string' || !HTTP_URL.test(company.url.trim())) {
        fail('Missing or invalid "company.url" (must be an http(s) URL).');
    }

    if (data.faq !== undefined && !Array.isArray(data.faq)) {
        fail('"faq" must be an array of { question, answer } objects.');
    }
    for (const [i, item] of (data.faq || []).entries()) {
        if (!isPlainObject(item) || typeof item.question !== 'string' || typeof item.answer !== 'string') {
            fail(`"faq[${i}]" must be an object with string "question" and "answer".`);
        }
    }

    if (data.services !== undefined && !Array.isArray(data.services)) {
        fail('"services" must be an array.');
    }
    if (data.pages !== undefined && !Array.isArray(data.pages)) {
        fail('"pages" must be an array.');
    }
    if (data.geoScore !== undefined) {
        const score = Number(data.geoScore);
        if (!Number.isFinite(score) || score < 0 || score > 100) {
            fail('"geoScore" must be a number between 0 and 100.');
        }
    }
    return data;
}
