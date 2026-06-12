/**
 * Unified LLM client with provider fallback chain.
 *
 * Tries each configured provider in order and falls through on error or
 * missing key, so the app keeps working when a free-tier quota runs out.
 * Returns null when no provider succeeds — callers use their demo fallback.
 *
 * Configuration (.env.local):
 *   LLM_PROVIDERS=groq,mistral,gemini,openai   (order = priority; optional)
 *   GROQ_API_KEY      — console.groq.com        (free tier)
 *   MISTRAL_API_KEY   — console.mistral.ai      (free tier)
 *   GEMINI_API_KEY    — aistudio.google.com
 *   OPENAI_API_KEY    — platform.openai.com     (paid)
 */

const DEFAULT_CHAIN = ['groq', 'mistral', 'gemini', 'openai'];

const PROVIDERS = {
    groq: {
        kind: 'openai-compatible',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        keyEnv: 'GROQ_API_KEY',
        model: () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    },
    mistral: {
        kind: 'openai-compatible',
        url: 'https://api.mistral.ai/v1/chat/completions',
        keyEnv: 'MISTRAL_API_KEY',
        model: () => process.env.MISTRAL_MODEL || 'mistral-small-latest',
    },
    openai: {
        kind: 'openai-compatible',
        url: 'https://api.openai.com/v1/chat/completions',
        keyEnv: 'OPENAI_API_KEY',
        model: () => process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    gemini: {
        kind: 'gemini',
        keyEnv: 'GEMINI_API_KEY',
        model: () => process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    },
};

function providerChain() {
    const configured = (process.env.LLM_PROVIDERS || process.env.LLM_PROVIDER || DEFAULT_CHAIN.join(','))
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter((p) => PROVIDERS[p]);
    const chain = configured.length ? configured : DEFAULT_CHAIN;
    return chain.filter((name) => process.env[PROVIDERS[name].keyEnv]);
}

async function callOpenAiCompatible(provider, systemPrompt, userPrompt, { temperature, maxTokens, json }) {
    const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env[provider.keyEnv]}`,
        },
        body: JSON.stringify({
            model: provider.model(),
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature,
            max_tokens: maxTokens,
            ...(json ? { response_format: { type: 'json_object' } } : {}),
        }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
}

async function callGemini(provider, systemPrompt, userPrompt, { temperature, maxTokens, json }) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${provider.model()}:generateContent?key=${process.env[provider.keyEnv]}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    ...(json ? { responseMimeType: 'application/json' } : {}),
                },
            }),
        }
    );
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

/**
 * Call the first available provider; fall through the chain on failure.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} [options]
 * @param {number} [options.temperature=0.7]
 * @param {number} [options.maxTokens=3000]
 * @param {boolean} [options.json=false] - request a JSON-only response
 * @returns {Promise<string|null>} model output, or null if every provider failed
 */
export async function callLLM(systemPrompt, userPrompt, options = {}) {
    const { temperature = 0.7, maxTokens = 3000, json = false } = options;

    for (const name of providerChain()) {
        const provider = PROVIDERS[name];
        try {
            const call = provider.kind === 'gemini' ? callGemini : callOpenAiCompatible;
            const text = await call(provider, systemPrompt, userPrompt, { temperature, maxTokens, json });
            if (text) return text;
            console.warn(`LLM provider "${name}" returned an empty response, trying next.`);
        } catch (err) {
            console.warn(`LLM provider "${name}" failed (${err.message}), trying next.`);
        }
    }
    return null;
}

/** True when at least one provider has an API key configured. */
export function hasLLMProvider() {
    return providerChain().length > 0;
}
