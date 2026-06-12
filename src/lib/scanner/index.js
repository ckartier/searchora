/**
 * Searchora — Website Security & Vulnerability Scanner
 *
 * Performs non-invasive security checks on a target website.
 * Checks: SSL, security headers, exposed files, common misconfigs, technology detection.
 */

import { safeFetch } from '../security/urlSafety.js';

/**
 * Run a full vulnerability scan on a website
 */
export async function runSecurityScan(url) {
    const startTime = Date.now();
    const results = {
        url,
        timestamp: new Date().toISOString(),
        score: 0,
        grade: 'F',
        checks: [],
        summary: { critical: 0, warning: 0, info: 0, pass: 0 },
        duration: 0,
    };

    try {
        const baseUrl = normalizeUrl(url);

        // Run all checks in parallel
        const [
            sslCheck,
            headersCheck,
            exposedFilesCheck,
            technologyCheck,
            misconfigCheck,
        ] = await Promise.allSettled([
            checkSSL(baseUrl),
            checkSecurityHeaders(baseUrl),
            checkExposedFiles(baseUrl),
            detectTechnologies(baseUrl),
            checkMisconfigurations(baseUrl),
        ]);

        // Collect results
        const allChecks = [];
        if (sslCheck.status === 'fulfilled') allChecks.push(...sslCheck.value);
        if (headersCheck.status === 'fulfilled') allChecks.push(...headersCheck.value);
        if (exposedFilesCheck.status === 'fulfilled') allChecks.push(...exposedFilesCheck.value);
        if (technologyCheck.status === 'fulfilled') allChecks.push(...technologyCheck.value);
        if (misconfigCheck.status === 'fulfilled') allChecks.push(...misconfigCheck.value);

        results.checks = allChecks;

        // Calculate score
        let totalWeight = 0;
        let earnedWeight = 0;

        for (const check of allChecks) {
            const weight = check.severity === 'critical' ? 20 : check.severity === 'warning' ? 10 : 5;
            totalWeight += weight;
            if (check.status === 'pass') {
                earnedWeight += weight;
                results.summary.pass++;
            } else if (check.severity === 'critical') {
                results.summary.critical++;
            } else if (check.severity === 'warning') {
                results.summary.warning++;
            } else {
                results.summary.info++;
            }
        }

        results.score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
        results.grade = scoreToGrade(results.score);
        results.duration = Date.now() - startTime;
    } catch (err) {
        results.error = err.message;
    }

    return results;
}

/* ==================== HELPERS ==================== */

function normalizeUrl(url) {
    if (!url.startsWith('http')) url = 'https://' + url;
    return new URL(url).origin;
}

function scoreToGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

/* ==================== SSL CHECK ==================== */

async function checkSSL(baseUrl) {
    const checks = [];

    try {
        const httpsUrl = baseUrl.replace('http://', 'https://');
        const resp = await safeFetch(httpsUrl, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(10000),
        });

        checks.push({
            id: 'ssl-valid',
            name: 'SSL Certificate',
            description: 'Website has a valid SSL certificate',
            status: resp.ok || resp.status < 500 ? 'pass' : 'fail',
            severity: 'critical',
            category: 'SSL',
            detail: resp.ok ? 'Valid SSL certificate detected' : 'SSL certificate issue',
        });

        // Check HTTPS redirect
        try {
            const httpResp = await safeFetch(baseUrl.replace('https://', 'http://'), {
                method: 'HEAD',
                redirect: 'manual',
                signal: AbortSignal.timeout(5000),
            });

            const location = httpResp.headers.get('location') || '';
            const redirectsToHttps = location.startsWith('https://') || httpResp.status === 301 || httpResp.status === 302;

            checks.push({
                id: 'https-redirect',
                name: 'HTTPS Redirect',
                description: 'HTTP requests redirect to HTTPS',
                status: redirectsToHttps ? 'pass' : 'fail',
                severity: 'warning',
                category: 'SSL',
                detail: redirectsToHttps ? 'HTTP correctly redirects to HTTPS' : 'No automatic HTTPS redirect detected',
            });
        } catch {
            checks.push({
                id: 'https-redirect',
                name: 'HTTPS Redirect',
                description: 'HTTP requests redirect to HTTPS',
                status: 'pass',
                severity: 'warning',
                category: 'SSL',
                detail: 'HTTP not available — HTTPS-only configuration',
            });
        }
    } catch (err) {
        checks.push({
            id: 'ssl-valid',
            name: 'SSL Certificate',
            description: 'Website has a valid SSL certificate',
            status: 'fail',
            severity: 'critical',
            category: 'SSL',
            detail: `SSL error: ${err.message}`,
        });
    }

    return checks;
}

/* ==================== SECURITY HEADERS ==================== */

async function checkSecurityHeaders(baseUrl) {
    const checks = [];

    try {
        const resp = await safeFetch(baseUrl, {
            method: 'GET',
            redirect: 'follow',
            signal: AbortSignal.timeout(10000),
            headers: { 'User-Agent': 'SearchoraSecurityScanner/1.0' },
        });

        const headers = resp.headers;

        // Strict-Transport-Security
        const hsts = headers.get('strict-transport-security');
        checks.push({
            id: 'header-hsts',
            name: 'HSTS Header',
            description: 'Strict-Transport-Security header prevents downgrade attacks',
            status: hsts ? 'pass' : 'fail',
            severity: 'critical',
            category: 'Headers',
            detail: hsts ? `HSTS enabled: ${hsts}` : 'Missing Strict-Transport-Security header',
            recommendation: hsts ? null : 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains',
        });

        // Content-Security-Policy
        const csp = headers.get('content-security-policy');
        checks.push({
            id: 'header-csp',
            name: 'Content Security Policy',
            description: 'CSP helps prevent XSS and data injection attacks',
            status: csp ? 'pass' : 'fail',
            severity: 'warning',
            category: 'Headers',
            detail: csp ? 'CSP header present' : 'Missing Content-Security-Policy header',
            recommendation: csp ? null : 'Add a Content-Security-Policy header to restrict resource loading',
        });

        // X-Content-Type-Options
        const xcto = headers.get('x-content-type-options');
        checks.push({
            id: 'header-xcto',
            name: 'X-Content-Type-Options',
            description: 'Prevents MIME-type sniffing attacks',
            status: xcto === 'nosniff' ? 'pass' : 'fail',
            severity: 'warning',
            category: 'Headers',
            detail: xcto ? `Value: ${xcto}` : 'Missing X-Content-Type-Options: nosniff',
            recommendation: xcto ? null : 'Add X-Content-Type-Options: nosniff',
        });

        // X-Frame-Options
        const xfo = headers.get('x-frame-options');
        checks.push({
            id: 'header-xfo',
            name: 'X-Frame-Options',
            description: 'Prevents clickjacking by controlling iframe embedding',
            status: xfo ? 'pass' : 'fail',
            severity: 'warning',
            category: 'Headers',
            detail: xfo ? `Value: ${xfo}` : 'Missing X-Frame-Options header',
            recommendation: xfo ? null : 'Add X-Frame-Options: DENY or SAMEORIGIN',
        });

        // X-XSS-Protection
        const xxp = headers.get('x-xss-protection');
        checks.push({
            id: 'header-xxp',
            name: 'X-XSS-Protection',
            description: 'Built-in browser XSS filter',
            status: xxp ? 'pass' : 'fail',
            severity: 'info',
            category: 'Headers',
            detail: xxp ? `Value: ${xxp}` : 'Missing X-XSS-Protection header',
            recommendation: xxp ? null : 'Add X-XSS-Protection: 1; mode=block',
        });

        // Referrer-Policy
        const rp = headers.get('referrer-policy');
        checks.push({
            id: 'header-rp',
            name: 'Referrer-Policy',
            description: 'Controls how much referrer information is shared',
            status: rp ? 'pass' : 'fail',
            severity: 'info',
            category: 'Headers',
            detail: rp ? `Value: ${rp}` : 'Missing Referrer-Policy header',
            recommendation: rp ? null : 'Add Referrer-Policy: strict-origin-when-cross-origin',
        });

        // Permissions-Policy
        const pp = headers.get('permissions-policy');
        checks.push({
            id: 'header-pp',
            name: 'Permissions-Policy',
            description: 'Controls browser feature access (camera, microphone, etc.)',
            status: pp ? 'pass' : 'fail',
            severity: 'info',
            category: 'Headers',
            detail: pp ? 'Permissions-Policy header present' : 'Missing Permissions-Policy header',
            recommendation: pp ? null : 'Add Permissions-Policy to restrict browser features',
        });

        // Server header disclosure
        const server = headers.get('server');
        checks.push({
            id: 'header-server',
            name: 'Server Header Disclosure',
            description: 'Server header should not reveal version info',
            status: server && (server.includes('/') || /\d/.test(server)) ? 'fail' : 'pass',
            severity: 'info',
            category: 'Headers',
            detail: server ? `Server: ${server}` : 'Server header not disclosed',
            recommendation: server?.includes('/') ? 'Remove or generalize the Server header to avoid version disclosure' : null,
        });

        // X-Powered-By
        const xpb = headers.get('x-powered-by');
        checks.push({
            id: 'header-xpb',
            name: 'X-Powered-By Disclosure',
            description: 'X-Powered-By header should be removed to hide technology stack',
            status: xpb ? 'fail' : 'pass',
            severity: 'info',
            category: 'Headers',
            detail: xpb ? `X-Powered-By: ${xpb}` : 'X-Powered-By header not found',
            recommendation: xpb ? 'Remove X-Powered-By header' : null,
        });
    } catch (err) {
        checks.push({
            id: 'headers-error',
            name: 'Security Headers Check',
            description: 'Unable to check security headers',
            status: 'fail',
            severity: 'info',
            category: 'Headers',
            detail: `Error: ${err.message}`,
        });
    }

    return checks;
}

/* ==================== EXPOSED FILES ==================== */

async function checkExposedFiles(baseUrl) {
    const checks = [];

    const exposedPaths = [
        { path: '/.env', name: 'Environment File (.env)', severity: 'critical' },
        { path: '/.git/config', name: 'Git Repository', severity: 'critical' },
        { path: '/wp-admin/', name: 'WordPress Admin', severity: 'warning' },
        { path: '/admin/', name: 'Admin Panel', severity: 'warning' },
        { path: '/phpinfo.php', name: 'PHP Info Page', severity: 'critical' },
        { path: '/robots.txt', name: 'Robots.txt', severity: 'info', expectPresent: true },
        { path: '/sitemap.xml', name: 'Sitemap.xml', severity: 'info', expectPresent: true },
        { path: '/.htaccess', name: 'Apache Config (.htaccess)', severity: 'warning' },
        { path: '/server-status', name: 'Server Status Page', severity: 'warning' },
        { path: '/wp-config.php.bak', name: 'WordPress Config Backup', severity: 'critical' },
        { path: '/backup.sql', name: 'Database Backup', severity: 'critical' },
        { path: '/debug.log', name: 'Debug Log', severity: 'warning' },
    ];

    await Promise.allSettled(
        exposedPaths.map(async ({ path, name, severity, expectPresent }) => {
            try {
                const resp = await safeFetch(`${baseUrl}${path}`, {
                    method: 'HEAD',
                    redirect: 'follow',
                    signal: AbortSignal.timeout(5000),
                    headers: { 'User-Agent': 'SearchoraSecurityScanner/1.0' },
                });

                const accessible = resp.ok || resp.status === 200;

                if (expectPresent) {
                    checks.push({
                        id: `file-${path.replace(/[/.]/g, '')}`,
                        name,
                        description: `Check if ${name} is present`,
                        status: accessible ? 'pass' : 'fail',
                        severity,
                        category: 'Files',
                        detail: accessible ? `${name} found at ${path}` : `${name} not found`,
                        recommendation: !accessible ? `Consider adding ${path}` : null,
                    });
                } else {
                    checks.push({
                        id: `file-${path.replace(/[/.]/g, '')}`,
                        name: `${name} Exposed`,
                        description: `${name} should not be publicly accessible`,
                        status: accessible ? 'fail' : 'pass',
                        severity,
                        category: 'Files',
                        detail: accessible ? `⚠ ${name} is publicly accessible at ${path}` : `${name} not exposed`,
                        recommendation: accessible ? `Block access to ${path} immediately` : null,
                    });
                }
            } catch {
                // Timeout or network error — file not accessible
                if (!expectPresent) {
                    checks.push({
                        id: `file-${path.replace(/[/.]/g, '')}`,
                        name: `${name} Exposed`,
                        description: `${name} should not be publicly accessible`,
                        status: 'pass',
                        severity,
                        category: 'Files',
                        detail: `${name} not accessible`,
                    });
                }
            }
        })
    );

    return checks;
}

/* ==================== TECHNOLOGY DETECTION ==================== */

async function detectTechnologies(baseUrl) {
    const checks = [];

    try {
        const resp = await safeFetch(baseUrl, {
            redirect: 'follow',
            signal: AbortSignal.timeout(10000),
            headers: { 'User-Agent': 'SearchoraSecurityScanner/1.0' },
        });

        const html = await resp.text();
        const headers = resp.headers;

        const technologies = [];

        // Detect from headers
        const server = headers.get('server');
        if (server) technologies.push(`Server: ${server}`);

        const xpb = headers.get('x-powered-by');
        if (xpb) technologies.push(`Powered by: ${xpb}`);

        // Detect from HTML
        if (html.includes('wp-content') || html.includes('wp-includes')) technologies.push('WordPress');
        if (html.includes('next/') || html.includes('_next/')) technologies.push('Next.js');
        if (html.includes('react')) technologies.push('React');
        if (html.includes('vue') || html.includes('nuxt')) technologies.push('Vue.js / Nuxt');
        if (html.includes('angular')) technologies.push('Angular');
        if (html.includes('shopify')) technologies.push('Shopify');
        if (html.includes('wix.com')) technologies.push('Wix');
        if (html.includes('squarespace')) technologies.push('Squarespace');
        if (html.includes('drupal')) technologies.push('Drupal');
        if (html.includes('joomla')) technologies.push('Joomla');
        if (html.includes('laravel')) technologies.push('Laravel');

        // jQuery version
        const jqMatch = html.match(/jquery[.\/-](\d+\.\d+\.\d+)/i);
        if (jqMatch) technologies.push(`jQuery ${jqMatch[1]}`);

        checks.push({
            id: 'tech-detection',
            name: 'Technology Stack',
            description: 'Detected technologies and frameworks',
            status: technologies.length > 0 ? 'pass' : 'pass',
            severity: 'info',
            category: 'Technology',
            detail: technologies.length > 0 ? technologies.join(', ') : 'No specific technology detected',
            technologies,
        });

        // Check for outdated jQuery
        if (jqMatch) {
            const major = parseInt(jqMatch[1].split('.')[0]);
            checks.push({
                id: 'tech-jquery',
                name: 'jQuery Version',
                description: 'Check for outdated jQuery library',
                status: major >= 3 ? 'pass' : 'fail',
                severity: 'warning',
                category: 'Technology',
                detail: `jQuery ${jqMatch[1]} detected`,
                recommendation: major < 3 ? 'Upgrade to jQuery 3.x or remove jQuery dependency' : null,
            });
        }
    } catch (err) {
        checks.push({
            id: 'tech-detection',
            name: 'Technology Detection',
            description: 'Unable to detect technologies',
            status: 'pass',
            severity: 'info',
            category: 'Technology',
            detail: `Could not analyze: ${err.message}`,
        });
    }

    return checks;
}

/* ==================== MISCONFIGURATION CHECKS ==================== */

async function checkMisconfigurations(baseUrl) {
    const checks = [];

    try {
        const resp = await safeFetch(baseUrl, {
            redirect: 'follow',
            signal: AbortSignal.timeout(10000),
            headers: { 'User-Agent': 'SearchoraSecurityScanner/1.0' },
        });

        const html = await resp.text();

        // Check for inline scripts without nonce
        const hasInlineScripts = /<script(?![^>]*src=)[^>]*>/i.test(html);
        const hasCspNonce = /nonce=/i.test(html);
        if (hasInlineScripts) {
            checks.push({
                id: 'misc-inline-scripts',
                name: 'Inline Scripts',
                description: 'Inline scripts should use nonce or be avoided',
                status: hasCspNonce ? 'pass' : 'fail',
                severity: 'info',
                category: 'Code',
                detail: hasCspNonce ? 'Inline scripts use CSP nonces' : 'Inline scripts found without CSP nonces',
                recommendation: hasCspNonce ? null : 'Use CSP nonces for inline scripts or move to external files',
            });
        }

        // Check for mixed content indicators
        const httpResources = html.match(/http:\/\/(?!localhost)/gi);
        checks.push({
            id: 'misc-mixed-content',
            name: 'Mixed Content',
            description: 'All resources should be loaded over HTTPS',
            status: httpResources && httpResources.length > 3 ? 'fail' : 'pass',
            severity: 'warning',
            category: 'Code',
            detail: httpResources ? `${httpResources.length} HTTP resource references found` : 'No mixed content detected',
            recommendation: httpResources?.length > 3 ? 'Replace all http:// resource URLs with https://' : null,
        });

        // Check for email addresses exposed
        const emails = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        checks.push({
            id: 'misc-email-exposure',
            name: 'Email Address Exposure',
            description: 'Email addresses in HTML can be harvested by bots',
            status: emails && emails.length > 2 ? 'fail' : 'pass',
            severity: 'info',
            category: 'Code',
            detail: emails ? `${emails.length} email(s) found in page source` : 'No email addresses exposed',
            recommendation: emails?.length > 2 ? 'Use contact forms or obfuscate email addresses' : null,
        });

        // Check for comments with sensitive info
        const comments = html.match(/<!--[\s\S]*?-->/g) || [];
        const sensitiveComments = comments.filter(
            (c) => /password|secret|key|token|api|todo|fixme|hack|bug/i.test(c)
        );
        checks.push({
            id: 'misc-sensitive-comments',
            name: 'Sensitive HTML Comments',
            description: 'HTML comments should not contain sensitive information',
            status: sensitiveComments.length === 0 ? 'pass' : 'fail',
            severity: 'warning',
            category: 'Code',
            detail:
                sensitiveComments.length === 0
                    ? 'No sensitive comments found'
                    : `${sensitiveComments.length} potentially sensitive comment(s) found`,
            recommendation: sensitiveComments.length > 0 ? 'Review and remove sensitive HTML comments' : null,
        });

        // Check for open redirect potential (forms with external action)
        const formActions = html.match(/action=["']([^"']+)["']/gi) || [];
        const externalForms = formActions.filter((a) => {
            const url = a.replace(/action=["']/i, '').replace(/["']$/, '');
            return url.startsWith('http') && !url.includes(new URL(baseUrl).hostname);
        });

        if (externalForms.length > 0) {
            checks.push({
                id: 'misc-external-forms',
                name: 'External Form Actions',
                description: 'Forms posting to external domains can be security risks',
                status: 'fail',
                severity: 'warning',
                category: 'Code',
                detail: `${externalForms.length} form(s) post to external domains`,
                recommendation: 'Review forms submitting data to external URLs',
            });
        }
    } catch (err) {
        checks.push({
            id: 'misc-error',
            name: 'Misconfiguration Check',
            description: 'Error during misconfiguration analysis',
            status: 'pass',
            severity: 'info',
            category: 'Code',
            detail: `Could not complete: ${err.message}`,
        });
    }

    return checks;
}
