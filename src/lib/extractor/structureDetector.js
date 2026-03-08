/**
 * Structure Detector — FAQ, tables, lists, comparison blocks, definitions, how-to
 */

/**
 * Detect FAQ sections on the page
 */
export function detectFAQ($) {
    const faqSignals = [];

    // 1. Check for FAQ schema
    let hasFaqSchema = false;
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const data = JSON.parse($(el).html());
            const json = JSON.stringify(data);
            if (json.includes('FAQPage') || json.includes('Question')) {
                hasFaqSchema = true;
            }
        } catch { }
    });

    if (hasFaqSchema) {
        faqSignals.push({ type: 'schema', confidence: 'high' });
    }

    // 2. Check for question-like headings
    const questionHeadings = [];
    $('h2, h3, h4').each((_, el) => {
        const text = $(el).text().trim();
        if (isQuestionText(text)) {
            questionHeadings.push(text);
        }
    });

    if (questionHeadings.length >= 3) {
        faqSignals.push({
            type: 'question-headings',
            confidence: 'high',
            count: questionHeadings.length,
            samples: questionHeadings.slice(0, 5),
        });
    }

    // 3. Check for accordion/FAQ patterns
    const accordionElements = $(
        '[class*="faq"], [class*="accordion"], [id*="faq"], [class*="question"], details'
    );
    if (accordionElements.length >= 2) {
        faqSignals.push({
            type: 'faq-elements',
            confidence: 'medium',
            count: accordionElements.length,
        });
    }

    // 4. Check for Q&A-style dt/dd
    const dtElements = $('dl dt');
    if (dtElements.length >= 2) {
        let questionDts = 0;
        dtElements.each((_, el) => {
            if (isQuestionText($(el).text().trim())) questionDts++;
        });
        if (questionDts >= 2) {
            faqSignals.push({ type: 'definition-list', confidence: 'medium', count: questionDts });
        }
    }

    return {
        hasFAQ: faqSignals.length > 0,
        faqSignals,
        questionCount: questionHeadings.length,
        questions: questionHeadings.slice(0, 10),
    };
}

/**
 * Detect tables on the page
 */
export function detectTables($) {
    const tables = [];

    $('table').each((_, el) => {
        const $table = $(el);
        const rows = $table.find('tr').length;
        const cols = $table.find('tr').first().children('td, th').length;
        const hasHeader = $table.find('thead, th').length > 0;
        const caption = $table.find('caption').text().trim();

        // Skip tiny tables (likely layout)
        if (rows < 2 || cols < 2) return;

        tables.push({
            rows,
            cols,
            hasHeader,
            caption: caption || null,
        });
    });

    return {
        hasTable: tables.length > 0,
        tableCount: tables.length,
        tables: tables.slice(0, 10),
    };
}

/**
 * Detect structured lists
 */
export function detectLists($) {
    let orderedLists = 0;
    let unorderedLists = 0;
    let totalItems = 0;

    // Count meaningful lists (those with sufficient items)
    $('ol').each((_, el) => {
        const items = $(el).children('li').length;
        if (items >= 3) {
            orderedLists++;
            totalItems += items;
        }
    });

    $('ul').each((_, el) => {
        const items = $(el).children('li').length;
        // Skip navigation-like lists
        const parent = $(el).parent();
        const isNav =
            parent.is('nav') ||
            parent.attr('role') === 'navigation' ||
            /\b(nav|menu)\b/i.test(parent.attr('class') || '');

        if (items >= 3 && !isNav) {
            unorderedLists++;
            totalItems += items;
        }
    });

    return {
        hasList: orderedLists + unorderedLists > 0,
        orderedLists,
        unorderedLists,
        totalListItems: totalItems,
    };
}

/**
 * Detect comparison structure
 */
export function detectComparison($) {
    const signals = [];

    // Check headings for comparison language
    $('h1, h2, h3').each((_, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (/\bvs\.?\b|\bversus\b|\bcompar/i.test(text)) {
            signals.push({ type: 'heading', text: $(el).text().trim() });
        }
        if (/\bbest\s+\w+\s+(for|of|in)\b/i.test(text)) {
            signals.push({ type: 'best-of-heading', text: $(el).text().trim() });
        }
        if (/\balternative/i.test(text)) {
            signals.push({ type: 'alternatives-heading', text: $(el).text().trim() });
        }
    });

    // Check for comparison tables
    const comparisonTables = $('table').filter((_, el) => {
        const text = $(el).text().toLowerCase();
        return /\bpros?\b.*\bcons?\b/i.test(text) || /\bfeature/i.test(text);
    });

    if (comparisonTables.length > 0) {
        signals.push({ type: 'comparison-table', count: comparisonTables.length });
    }

    return {
        hasComparison: signals.length > 0,
        comparisonSignals: signals,
    };
}

/**
 * Detect definition/glossary structure
 */
export function detectDefinitions($) {
    const signals = [];

    $('h1, h2, h3').each((_, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (/^what\s+is\b/i.test(text) || /^define\b/i.test(text) || /^definition\b/i.test(text)) {
            signals.push({ type: 'definition-heading', text: $(el).text().trim() });
        }
        if (/\bglossary\b/i.test(text) || /\bterms?\b/i.test(text)) {
            signals.push({ type: 'glossary-heading', text: $(el).text().trim() });
        }
    });

    // Definition lists
    if ($('dl').length > 0 && $('dl dt').length >= 3) {
        signals.push({ type: 'definition-list', count: $('dl dt').length });
    }

    return {
        hasDefinitions: signals.length > 0,
        definitionSignals: signals,
    };
}

/**
 * Detect how-to structure
 */
export function detectHowTo($) {
    const signals = [];

    // Schema
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = $(el).html();
            if (/HowTo/i.test(json)) {
                signals.push({ type: 'howto-schema' });
            }
        } catch { }
    });

    // Headings
    $('h1, h2, h3').each((_, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (/^how\s+to\b/i.test(text) || /^step\s+\d/i.test(text)) {
            signals.push({ type: 'howto-heading', text: $(el).text().trim() });
        }
    });

    // Numbered steps in ordered lists
    const stepLists = $('ol').filter((_, el) => {
        const items = $(el).children('li').length;
        return items >= 3 && items <= 20;
    });

    if (stepLists.length > 0) {
        signals.push({ type: 'step-list', count: stepLists.length });
    }

    return {
        hasHowTo: signals.length > 0,
        howToSignals: signals,
    };
}

/* ==================== Helpers ==================== */

function isQuestionText(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (
        text.endsWith('?') ||
        /^(what|how|why|when|where|which|who|can|does|do|is|are|should|will|would)\s/i.test(lower)
    );
}
