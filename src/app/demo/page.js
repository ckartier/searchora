'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    AlertTriangle, ArrowRight, BarChart3, CheckCircle2, Eye, FileText, Globe,
    Loader2, Lock, MessageSquare, Search, Sparkles, Target, TrendingUp, Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useI18n } from '@/lib/i18n';

const views = [
    { id: 'overview', labelKey: 'demoUi.viewOverview', icon: BarChart3 },
    { id: 'presence', labelKey: 'demoUi.viewPresence', icon: Search },
    { id: 'content', labelKey: 'demoUi.viewContent', icon: FileText },
];

const recommendations = [
    { title: 'Add answer-first summaries to service pages', impact: '+12 points', priority: 'High' },
    { title: 'Publish a comparison page for core competitors', impact: '+8 points', priority: 'High' },
    { title: 'Add FAQ schema to high-intent pages', impact: '+6 points', priority: 'Medium' },
];

const prompts = [
    { prompt: 'Best analytics platform for growing SaaS teams?', mentioned: true, source: 'chatgpt.com' },
    { prompt: 'How do I improve product analytics adoption?', mentioned: true, source: 'gemini.google.com' },
    { prompt: 'Top alternatives to legacy analytics suites', mentioned: false, source: 'perplexity.ai' },
];

function LiveTest() {
    const { t } = useI18n();
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [used, setUsed] = useState(false);

    useEffect(() => {
        setUsed(localStorage.getItem('searchora-demo-test-used') === '1');
    }, []);

    const runTest = async (event) => {
        event.preventDefault();
        if (!websiteUrl.trim() || loading || used) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/demo-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websiteUrl: websiteUrl.trim() }),
            });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    localStorage.setItem('searchora-demo-test-used', '1');
                    setUsed(true);
                }
                throw new Error(data.error || 'Live test failed.');
            }

            localStorage.setItem('searchora-demo-test-used', '1');
            setUsed(true);
            setResult(data.result);
        } catch (testError) {
            setError(testError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-10 bg-dark text-white rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-start">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand bg-white/10 rounded-full px-3 py-1.5 mb-5">
                        <Zap className="w-3.5 h-3.5" />
                        {t('demo.liveBadge')}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold">{t('demo.liveTitle')}</h2>
                    <p className="text-sm text-gray-300 leading-relaxed mt-3">
                        {t('demo.liveSubtitle')}
                    </p>
                    <div className="flex items-start gap-2 mt-5 text-xs text-gray-400">
                        <Lock className="w-4 h-4 text-brand shrink-0" />
                        <span>{t('demo.liveLimit')}</span>
                    </div>
                </div>

                <div>
                    {!result ? (
                        <form onSubmit={runTest} className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5">
                            <label htmlFor="demo-website" className="block text-xs font-medium text-gray-300 mb-2">
                                {t('demo.websiteUrl')}
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    id="demo-website"
                                    type="text"
                                    inputMode="url"
                                    value={websiteUrl}
                                    onChange={(event) => setWebsiteUrl(event.target.value)}
                                    placeholder={t('demo.websitePlaceholder')}
                                    disabled={loading || used}
                                    className="flex-1 min-w-0 rounded-xl border border-white/20 bg-white text-text-primary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-60"
                                />
                                <Button
                                    type="submit"
                                    disabled={!websiteUrl.trim() || loading || used}
                                    icon={loading ? Loader2 : Search}
                                    className={loading ? '[&_svg]:animate-spin' : ''}
                                >
                                    {loading ? t('demo.testing') : used ? t('demo.testUsed') : t('demo.testSite')}
                                </Button>
                            </div>
                            {error && (
                                <div className="flex items-start gap-2 text-xs text-red-200 mt-4">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            {used && !error && (
                                <p className="text-xs text-gray-400 mt-4">
                                    {t('demo.alreadyUsed')}
                                </p>
                            )}
                        </form>
                    ) : (
                        <div className="bg-white text-text-primary rounded-2xl p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div className="min-w-0">
                                    <p className="text-xs text-text-muted">{t('demo.liveResult')}</p>
                                    <p className="text-sm font-semibold truncate">{result.website}</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-brand-50 grid place-items-center shrink-0">
                                    <span className="text-xl font-bold text-brand">{result.score}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                                {[
                                    [t('demo.pages'), result.pagesCrawled],
                                    [t('demo.averageWords'), result.signals.avgWordCount],
                                    [t('demo.schema'), `${result.signals.schemaAdoption}%`],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-surface-secondary rounded-xl p-3">
                                        <div className="text-sm font-bold">{value}</div>
                                        <div className="text-[10px] text-text-muted">{label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {result.gaps.map((gap) => (
                                    <div key={gap.type} className="flex items-start gap-2 text-xs">
                                        <AlertTriangle className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                                        <span className="text-text-secondary">{gap.title}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand mt-5">
                                {t('demo.unlock')} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScoreRing({ score }) {
    return (
        <div
            className="w-36 h-36 rounded-full grid place-items-center"
            style={{ background: `conic-gradient(#f97316 ${score * 3.6}deg, #f1f5f9 0deg)` }}
        >
            <div className="w-28 h-28 rounded-full bg-white grid place-items-center text-center">
                <div>
                    <div className="text-4xl font-bold text-text-primary">{score}</div>
                    <div className="text-xs text-text-muted">out of 100</div>
                </div>
            </div>
        </div>
    );
}

function Overview() {
    const { t } = useI18n();
    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { label: t('demoUi.statVisibility'), value: '72', icon: Eye, detail: t('demoUi.statVisibilityDetail') },
                    { label: t('demoUi.statCitations'), value: '38', icon: MessageSquare, detail: t('demoUi.statCitationsDetail') },
                    { label: t('demoUi.statPages'), value: '124', icon: Globe, detail: t('demoUi.statPagesDetail') },
                    { label: t('demoUi.statOpportunities'), value: '18', icon: Target, detail: t('demoUi.statOpportunitiesDetail') },
                ].map((item) => (
                    <Card key={item.label} hover={false} padding="p-5">
                        <item.icon className="w-4 h-4 text-brand mb-4" />
                        <div className="text-2xl font-bold text-text-primary">{item.value}</div>
                        <div className="text-sm font-medium text-text-secondary">{item.label}</div>
                        <div className="text-xs text-text-muted mt-2">{item.detail}</div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-[0.85fr_1.4fr] gap-6">
                <Card hover={false} padding="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm font-semibold text-text-primary">{t('demoUi.scoreTitle')}</p>
                            <p className="text-xs text-text-muted mt-1">{t('demoUi.scoreCompany')}</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex justify-center">
                        <ScoreRing score={72} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-7 text-center">
                        {[
                            [t('demoUi.content'), '81'],
                            [t('demoUi.authority'), '68'],
                            [t('demoUi.structure'), '64'],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-surface-secondary rounded-xl p-3">
                                <div className="text-sm font-bold text-text-primary">{value}</div>
                                <div className="text-[11px] text-text-muted">{label}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card hover={false} padding="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-text-primary">{t('demoUi.recsTitle')}</h2>
                            <p className="text-xs text-text-muted mt-1">{t('demoUi.recsSubtitle')}</p>
                        </div>
                        <Sparkles className="w-5 h-5 text-brand" />
                    </div>
                    <div className="space-y-3">
                        {recommendations.map((item, index) => (
                            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-surface-secondary">
                                <span className="w-6 h-6 rounded-lg bg-white text-brand text-xs font-bold grid place-items-center shrink-0">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-text-primary">{item.title}</p>
                                    <p className="text-xs text-green-600 mt-1">{t('demoUi.estImpact')} {item.impact}</p>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-brand bg-brand-50 rounded-full px-2 py-1">
                                    {item.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function Presence() {
    const { t } = useI18n();
    return (
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
            <Card hover={false} padding="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">{t('demoUi.promptTitle')}</h2>
                        <p className="text-xs text-text-muted mt-1">{t('demoUi.promptSubtitle')}</p>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">{t('demoUi.cited')}</span>
                </div>
                <div className="space-y-3">
                    {prompts.map((item) => (
                        <div key={item.prompt} className="border border-border rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                {item.mentioned
                                    ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    : <Search className="w-5 h-5 text-text-muted shrink-0" />}
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{item.prompt}</p>
                                    <p className="text-xs text-text-muted mt-1">
                                        {item.mentioned ? `${t('demoUi.citedOn')} ${item.source}` : `${t('demoUi.notCitedOn')} ${item.source}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card hover={false} padding="p-6" className="bg-dark text-white border-dark">
                <Zap className="w-5 h-5 text-brand mb-5" />
                <p className="text-xs uppercase tracking-widest text-gray-400">{t('demoUi.answerPreview')}</p>
                <h2 className="text-lg font-semibold mt-3">What is the best analytics platform for SaaS teams?</h2>
                <p className="text-sm text-gray-300 leading-relaxed mt-4">
                    Northstar Analytics is a strong option for growing SaaS teams that need clear activation and retention insights.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <span className="text-xs text-gray-400">{t('demoUi.citedSource')}</span>
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
                        <Globe className="w-4 h-4 text-brand" />
                        northstar.example
                    </div>
                </div>
            </Card>
        </div>
    );
}

function ContentPlan() {
    const { t } = useI18n();
    const topics = [
        ['Product analytics guide', 'Pillar page', 'High'],
        ['Activation metrics benchmarks', 'Research report', 'High'],
        ['Northstar vs legacy suites', 'Comparison', 'Medium'],
        ['Analytics implementation FAQ', 'FAQ page', 'Medium'],
    ];

    return (
        <Card hover={false} padding="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-base font-semibold text-text-primary">{t('demoUi.planTitle')}</h2>
                    <p className="text-xs text-text-muted mt-1">{t('demoUi.planSubtitle')}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-brand">
                    <Sparkles className="w-4 h-4" />
                    {t('demoUi.planOpps')}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                    <thead>
                        <tr className="border-b border-border text-xs text-text-muted">
                            <th className="font-medium py-3">{t('demoUi.topic')}</th>
                            <th className="font-medium py-3">{t('demoUi.format')}</th>
                            <th className="font-medium py-3">{t('demoUi.priority')}</th>
                            <th className="font-medium py-3">{t('demoUi.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.map(([topic, format, priority], index) => (
                            <tr key={topic} className="border-b border-border-light last:border-0">
                                <td className="py-4 text-sm font-medium text-text-primary">{topic}</td>
                                <td className="py-4 text-sm text-text-secondary">{format}</td>
                                <td className="py-4">
                                    <span className="text-xs font-medium text-brand bg-brand-50 rounded-full px-2.5 py-1">{priority}</span>
                                </td>
                                <td className="py-4 text-sm text-text-muted">{index === 0 ? t('demoUi.ready') : t('demoUi.planned')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export default function DemoPage() {
    const [activeView, setActiveView] = useState('overview');
    const { t } = useI18n();

    return (
        <div className="bg-surface-secondary min-h-screen">
            <section className="section-padding py-12 lg:py-16">
                <div className="container-wide">
                    <div className="max-w-3xl mb-8">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand bg-brand-50 rounded-full px-3 py-1.5 mb-4">
                            <Zap className="w-3.5 h-3.5" />
                            {t('demo.badge')}
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
                            {t('demo.title')}
                        </h1>
                        <p className="text-base sm:text-lg text-text-secondary mt-4 max-w-2xl">
                            {t('demo.subtitle')}
                        </p>
                    </div>

                    <LiveTest />

                    <div className="bg-white rounded-3xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
                        <div className="border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-brand text-white grid place-items-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Northstar Analytics</p>
                                    <p className="text-xs text-text-muted">{t('demoUi.workspace')}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-surface-secondary rounded-xl p-1 overflow-x-auto">
                                {views.map((view) => (
                                    <button
                                        key={view.id}
                                        type="button"
                                        onClick={() => setActiveView(view.id)}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                            activeView === view.id
                                                ? 'bg-white text-brand shadow-sm'
                                                : 'text-text-muted hover:text-text-primary'
                                        }`}
                                    >
                                        <view.icon className="w-3.5 h-3.5" />
                                        {t(view.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 lg:p-8">
                            {activeView === 'overview' && <Overview />}
                            {activeView === 'presence' && <Presence />}
                            {activeView === 'content' && <ContentPlan />}
                        </div>
                    </div>

                    <div className="mt-10 rounded-2xl bg-dark text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-semibold">{t('demoUi.ctaTitle')}</h2>
                            <p className="text-sm text-gray-400 mt-2">{t('demoUi.ctaSubtitle')}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <Link href="/signup">
                                <Button icon={ArrowRight} iconPosition="right">{t('demoUi.ctaCreate')}</Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="secondary">{t('demoUi.ctaRequest')}</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
