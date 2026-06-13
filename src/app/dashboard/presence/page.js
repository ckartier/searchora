'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Search, Globe, Target, Plus, Trash2, Play, Loader2,
    CheckCircle2, XCircle, ArrowUpRight, BarChart3, TrendingUp,
    Eye, AlertTriangle, Zap, Trophy, Hash, ArrowRight, Info,
    RefreshCw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import {
    collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/apiClient';

/* ==================== PRESENCE RESULT BAR ==================== */
function PresenceBar({ value, label }) {
    const color = value >= 60 ? 'bg-green-500' : value >= 30 ? 'bg-yellow-500' : 'bg-red-400';
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-text-muted">{label}</span>
                <span className="text-xs font-bold text-text-primary">{value}%</span>
            </div>
            <div className="w-full bg-surface-secondary rounded-full h-2">
                <div
                    className={`${color} rounded-full h-2 transition-all duration-700`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

/* ==================== MAIN COMPONENT ==================== */
export default function PresencePage() {
    const { user } = useAuth();
    const { t } = useI18n();

    // Form state
    const [domain, setDomain] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [trackedPages, setTrackedPages] = useState(['']);
    const [prompts, setPrompts] = useState(['', '', '']);
    const [competitors, setCompetitors] = useState(['', '']);

    // Test state
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // History state
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Load test history
    useEffect(() => {
        async function loadHistory() {
            if (!user?.uid) return;
            try {
                const q = query(
                    collection(db, 'presence_tests'),
                    where('userId', '==', user.uid),
                );
                const snap = await getDocs(q);
                const items = snap.docs
                    .map((d) => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => {
                        const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                        const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                        return tb - ta;
                    })
                    .slice(0, 10);
                setHistory(items);
            } catch (err) {
                console.error('Failed to load history:', err);
            } finally {
                setLoadingHistory(false);
            }
        }
        loadHistory();
    }, [user?.uid]);

    const addField = (setter, current) => setter([...current, '']);
    const removeField = (setter, current, index) => setter(current.filter((_, i) => i !== index));
    const updateField = (setter, current, index, value) => {
        const updated = [...current];
        updated[index] = value;
        setter(updated);
    };

    /* ==================== RUN TEST ==================== */
    const runTest = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setProgress({ message: 'Initializing presence test...', current: 0, total: 0 });

        try {
            const resp = await authFetch('/api/presence-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain,
                    companyName,
                    trackedPages: trackedPages.filter(Boolean),
                    prompts: prompts.filter(Boolean),
                    competitors: competitors.filter(Boolean),
                    userId: user?.uid || null,
                }),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || 'Test failed');
            }

            const data = await resp.json();
            setResult(data.test);

            // Save to Firestore
            if (user?.uid) {
                try {
                    await addDoc(collection(db, 'presence_tests'), {
                        userId: user.uid,
                        domain: data.test.domain,
                        companyName: data.test.companyName,
                        presenceRate: data.test.presenceRate,
                        totalMentions: data.test.totalMentions,
                        promptCount: data.test.promptCount,
                        avgPosition: data.test.avgPosition,
                        competitorLeaderboard: data.test.competitorLeaderboard || [],
                        domainLeaderboard: (data.test.domainLeaderboard || []).slice(0, 15),
                        prompts: data.test.prompts,
                        duration: data.test.duration,
                        createdAt: serverTimestamp(),
                    });
                } catch (saveErr) {
                    console.error('Failed to save test:', saveErr);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setProgress(null);
        }
    };

    /* ==================== LOADING STATE ==================== */
    if (loading) {
        return (
            <div className="max-w-md mx-auto space-y-6 py-8 animate-fade-in">
                <div className="text-center">
                    <div className="orbit-loader mx-auto mb-6">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">
                        {t('presence.testing')}
                    </h2>
                    <p className="text-sm text-text-muted">
                        {progress?.message || t('presence.sendingPrompts')}
                    </p>
                </div>
                {progress?.total > 0 ? (
                    <div>
                        <div className="flex justify-between text-sm text-text-muted mb-2">
                            <span>{t('presence.progress')}</span>
                            <span>{progress.current}/{progress.total}</span>
                        </div>
                        <div className="w-full bg-surface-secondary rounded-full h-2">
                            <div
                                className="bg-brand rounded-full h-2 transition-all duration-500"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="progress-bar-indeterminate rounded-full" />
                )}
                <div className="flex items-center justify-center gap-2 text-text-muted">
                    <span className="text-sm">{t('presence.analyzing')}</span>
                    <span className="typing-cursor" />
                </div>
            </div>
        );
    }

    /* ==================== RESULTS ==================== */
    if (result) {
        const scoreColor = result.presenceRate >= 60 ? 'text-green-600' :
            result.presenceRate >= 30 ? 'text-yellow-600' : 'text-red-500';
        const scoreBg = result.presenceRate >= 60 ? 'bg-green-50' :
            result.presenceRate >= 30 ? 'bg-yellow-50' : 'bg-red-50';

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{t('presence.resultsTitle')}</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            {result.domain} · {result.promptCount} {t('presence.promptsTested')} · {Math.round(result.duration / 1000)}s
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" icon={RefreshCw}
                            onClick={() => setResult(null)}>
                            {t('presence.newTest')}
                        </Button>
                    </div>
                </div>

                {/* Score cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card hover={false} padding="p-5" className={scoreBg}>
                        <Eye className={`w-5 h-5 ${scoreColor} mb-2`} />
                        <div className={`text-3xl font-bold ${scoreColor}`}>{result.presenceRate}%</div>
                        <div className="text-[11px] text-text-muted mt-1">{t('presence.presenceRate')}</div>
                    </Card>
                    <Card hover={false} padding="p-5">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                        <div className="text-3xl font-bold text-text-primary">
                            {result.totalMentions}/{result.promptCount}
                        </div>
                        <div className="text-[11px] text-text-muted mt-1">{t('presence.promptsWithMention')}</div>
                    </Card>
                    <Card hover={false} padding="p-5">
                        <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="text-3xl font-bold text-text-primary">
                            {result.avgPosition > 0 ? `#${result.avgPosition}` : '—'}
                        </div>
                        <div className="text-[11px] text-text-muted mt-1">{t('presence.avgPosition')}</div>
                    </Card>
                    <Card hover={false} padding="p-5">
                        <Target className="w-5 h-5 text-orange-500 mb-2" />
                        <div className="text-3xl font-bold text-text-primary">{result.totalCompetitorMentions}</div>
                        <div className="text-[11px] text-text-muted mt-1">{t('presence.competitorMentions')}</div>
                    </Card>
                </div>

                {/* Per-prompt results */}
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">
                        {t('presence.perPrompt')}
                    </h3>
                    <div className="space-y-3">
                        {result.results.map((r, i) => (
                            <PromptResult key={i} result={r} index={i} />
                        ))}
                    </div>
                </Card>

                {/* Domain leaderboard */}
                {result.domainLeaderboard?.length > 0 && (
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            {t('presence.domainLeaderboard')}
                        </h3>
                        <div className="space-y-2">
                            {result.domainLeaderboard.slice(0, 10).map((d, i) => (
                                <div key={d.domain}
                                    className={`flex items-center justify-between p-3 rounded-xl ${d.isClient ? 'bg-green-50 border border-green-200' :
                                        d.isCompetitor ? 'bg-red-50 border border-red-200' :
                                            'bg-surface-secondary'
                                        }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-text-muted w-5">#{i + 1}</span>
                                        <span className={`text-sm font-medium ${d.isClient ? 'text-green-700' :
                                            d.isCompetitor ? 'text-red-600' : 'text-text-primary'
                                            }`}>
                                            {d.domain}
                                        </span>
                                        {d.isClient && (
                                            <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{t('presence.you')}</span>
                                        )}
                                        {d.isCompetitor && (
                                            <span className="text-[10px] font-medium bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{t('presence.competitorTag')}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-text-primary">
                                        {d.mentions} {d.mentions > 1 ? t('presence.mentions') : t('presence.mention')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Competitor comparison */}
                {result.competitorLeaderboard?.length > 0 && (
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">
                            {t('presence.comparisonTitle')}
                        </h3>
                        <div className="space-y-3">
                            {/* Client bar */}
                            <PresenceBar value={result.presenceRate} label={`${result.domain} ${t('presence.youSuffix')}`} />
                            {/* Competitor bars */}
                            {result.competitorLeaderboard.map((c) => (
                                <PresenceBar key={c.domain} value={c.presenceRate} label={c.domain} />
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    /* ==================== FORM ==================== */
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">{t('presence.title')}</h1>
                <p className="text-sm text-text-secondary mt-1">
                    {t('presence.subtitle')}
                </p>
            </div>

            {/* Info banner */}
            <Card hover={false} padding="p-4" className="border-blue-200 bg-blue-50/50">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">{t('presence.howItWorks')}</p>
                        <p className="text-xs text-text-secondary mt-1">
                            {t('presence.howItWorksDesc')}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Form */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left — Domain & Pages */}
                <div className="space-y-6">
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">{t('presence.yourBrand')}</h3>
                        <div className="space-y-4">
                            <Input
                                label={t('presence.domain')}
                                placeholder="prophot.com"
                                icon={Globe}
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                required
                            />
                            <Input
                                label={t('presence.companyName')}
                                placeholder="ProPhot"
                                icon={Target}
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                    </Card>

                    <Card hover={false} padding="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-text-primary">{t('presence.trackedPages')}</h3>
                            <button onClick={() => addField(setTrackedPages, trackedPages)}
                                className="text-xs text-brand hover:text-brand-600 font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="w-3 h-3" /> {t('presence.add')}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {trackedPages.map((page, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        placeholder="prophot.com/guides/studio-flash"
                                        value={page}
                                        onChange={(e) => updateField(setTrackedPages, trackedPages, i, e.target.value)}
                                        className="flex-1"
                                    />
                                    {trackedPages.length > 1 && (
                                        <button onClick={() => removeField(setTrackedPages, trackedPages, i)}
                                            className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card hover={false} padding="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-text-primary">{t('presence.competitors')}</h3>
                            <button onClick={() => addField(setCompetitors, competitors)}
                                className="text-xs text-brand hover:text-brand-600 font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="w-3 h-3" /> {t('presence.add')}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {competitors.map((comp, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        placeholder="bhphoto.com"
                                        value={comp}
                                        onChange={(e) => updateField(setCompetitors, competitors, i, e.target.value)}
                                        className="flex-1"
                                    />
                                    {competitors.length > 1 && (
                                        <button onClick={() => removeField(setCompetitors, competitors, i)}
                                            className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right — Prompts */}
                <div className="space-y-6">
                    <Card hover={false} padding="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary">{t('presence.testPrompts')}</h3>
                                <p className="text-xs text-text-muted mt-0.5">
                                    {t('presence.promptsHint')}
                                </p>
                            </div>
                            <button onClick={() => addField(setPrompts, prompts)}
                                disabled={prompts.length >= 20}
                                className="text-xs text-brand hover:text-brand-600 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50">
                                <Plus className="w-3 h-3" /> {t('presence.add')}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {prompts.map((prompt, i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-[10px] font-bold text-text-muted w-5 shrink-0">{i + 1}</span>
                                        <Input
                                            placeholder="best studio flash for portraits"
                                            value={prompt}
                                            onChange={(e) => updateField(setPrompts, prompts, i, e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                    {prompts.length > 1 && (
                                        <button onClick={() => removeField(setPrompts, prompts, i)}
                                            className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Run button */}
                    <Button
                        size="lg"
                        icon={Play}
                        onClick={runTest}
                        disabled={!domain || prompts.filter(Boolean).length === 0}
                        className="w-full shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
                    >
                        {t('presence.runTest')} ({prompts.filter(Boolean).length} {t('presence.promptsCount')})
                    </Button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Test history */}
            {history.length > 0 && (
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">{t('presence.recentTests')}</h3>
                    <div className="space-y-2">
                        {history.map((test) => (
                            <div key={test.id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${test.presenceRate >= 60 ? 'bg-green-50 text-green-600' :
                                        test.presenceRate >= 30 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
                                        }`}>
                                        {test.presenceRate}%
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{test.domain}</p>
                                        <p className="text-[10px] text-text-muted">
                                            {test.promptCount} prompts · {test.totalMentions} mentions
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-text-muted">
                                    {test.createdAt?.toDate?.()
                                        ? new Date(test.createdAt.toDate()).toLocaleDateString()
                                        : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

/* ==================== PROMPT RESULT COMPONENT ==================== */
function PromptResult({ result: r, index }) {
    const { t } = useI18n();
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-xl border transition-all ${r.clientMentioned
            ? 'border-green-200 bg-green-50/50'
            : 'border-border bg-surface-secondary'
            }`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 p-3 cursor-pointer text-left"
            >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${r.clientMentioned
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-500'
                    }`}>
                    {r.clientMentioned
                        ? <CheckCircle2 className="w-4 h-4" />
                        : <XCircle className="w-4 h-4" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                        &quot;{r.prompt}&quot;
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {r.clientMentioned && (
                            <span className="text-[10px] font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                                {r.brandMentionType === 'domain+brand' ? t('presence.domainBrand') :
                                    r.brandMentionType === 'domain' ? t('presence.domainCited') :
                                        r.brandMentionType === 'brand' ? t('presence.brandMentioned') : t('presence.mentioned')}
                            </span>
                        )}
                        {r.positionEstimate > 0 && (
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {t('presence.position')} #{r.positionEstimate}
                            </span>
                        )}
                        {r.competitorMentions.length > 0 && (
                            <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                                {r.competitorMentions.length} {t('presence.competitorsFound')}
                            </span>
                        )}
                        <span className="text-[10px] text-text-muted">
                            {r.mentionedDomains.length} {t('presence.domainsFound')}
                        </span>
                    </div>
                </div>
                <ArrowRight className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {expanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                    {/* AI Response */}
                    <div>
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">{t('presence.aiResponse')}</p>
                        <p className="text-xs text-text-secondary leading-relaxed bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                            {r.response || t('presence.noResponse')}
                        </p>
                    </div>

                    {/* Mentioned domains */}
                    {r.mentionedDomains.length > 0 && (
                        <div>
                            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">{t('presence.citedDomains')}</p>
                            <div className="flex flex-wrap gap-1">
                                {r.mentionedDomains.map((d) => (
                                    <span key={d} className="text-[10px] font-medium bg-gray-100 text-text-secondary px-2 py-1 rounded-lg">
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tracked pages */}
                    {r.trackedPagesMentioned?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-medium text-green-600 uppercase tracking-wider mb-1">{t('presence.yourPagesCited')}</p>
                            <div className="flex flex-wrap gap-1">
                                {r.trackedPagesMentioned.map((p) => (
                                    <span key={p} className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
