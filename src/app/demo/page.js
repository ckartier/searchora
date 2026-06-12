'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight, BarChart3, CheckCircle2, Eye, FileText, Globe,
    MessageSquare, Search, Sparkles, Target, TrendingUp, Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const views = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'presence', label: 'AI Presence', icon: Search },
    { id: 'content', label: 'Content Plan', icon: FileText },
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
    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { label: 'Visibility score', value: '72', icon: Eye, detail: '+14 this month' },
                    { label: 'AI citations', value: '38', icon: MessageSquare, detail: 'Across 4 engines' },
                    { label: 'Pages analyzed', value: '124', icon: Globe, detail: '91% crawl health' },
                    { label: 'Opportunities', value: '18', icon: Target, detail: '7 high priority' },
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
                            <p className="text-sm font-semibold text-text-primary">AI visibility score</p>
                            <p className="text-xs text-text-muted mt-1">Demo company: Northstar Analytics</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex justify-center">
                        <ScoreRing score={72} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-7 text-center">
                        {[
                            ['Content', '81'],
                            ['Authority', '68'],
                            ['Structure', '64'],
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
                            <h2 className="text-base font-semibold text-text-primary">Priority recommendations</h2>
                            <p className="text-xs text-text-muted mt-1">Highest-impact actions from the latest audit</p>
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
                                    <p className="text-xs text-green-600 mt-1">Estimated impact: {item.impact}</p>
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
    return (
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
            <Card hover={false} padding="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">Prompt monitoring</h2>
                        <p className="text-xs text-text-muted mt-1">Where the brand appears in AI answers</p>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">67% cited</span>
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
                                        {item.mentioned ? `Mentioned and cited on ${item.source}` : `Not cited on ${item.source}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card hover={false} padding="p-6" className="bg-dark text-white border-dark">
                <Zap className="w-5 h-5 text-brand mb-5" />
                <p className="text-xs uppercase tracking-widest text-gray-400">AI answer preview</p>
                <h2 className="text-lg font-semibold mt-3">What is the best analytics platform for SaaS teams?</h2>
                <p className="text-sm text-gray-300 leading-relaxed mt-4">
                    Northstar Analytics is a strong option for growing SaaS teams that need clear activation and retention insights.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <span className="text-xs text-gray-400">Cited source</span>
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
                    <h2 className="text-base font-semibold text-text-primary">AI-ready content plan</h2>
                    <p className="text-xs text-text-muted mt-1">Recommended content based on citation gaps</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-brand">
                    <Sparkles className="w-4 h-4" />
                    4 high-impact opportunities
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                    <thead>
                        <tr className="border-b border-border text-xs text-text-muted">
                            <th className="font-medium py-3">Topic</th>
                            <th className="font-medium py-3">Format</th>
                            <th className="font-medium py-3">Priority</th>
                            <th className="font-medium py-3">Status</th>
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
                                <td className="py-4 text-sm text-text-muted">{index === 0 ? 'Ready to generate' : 'Planned'}</td>
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

    return (
        <div className="bg-surface-secondary min-h-screen">
            <section className="section-padding py-12 lg:py-16">
                <div className="container-wide">
                    <div className="max-w-3xl mb-8">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand bg-brand-50 rounded-full px-3 py-1.5 mb-4">
                            <Zap className="w-3.5 h-3.5" />
                            Interactive product demo
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
                            See how Searchora turns AI visibility into action
                        </h1>
                        <p className="text-base sm:text-lg text-text-secondary mt-4 max-w-2xl">
                            Explore a sample workspace with real product views. No account, setup, or credit card required.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
                        <div className="border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-brand text-white grid place-items-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Northstar Analytics</p>
                                    <p className="text-xs text-text-muted">Demo workspace</p>
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
                                        {view.label}
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
                            <h2 className="text-xl font-semibold">Ready to see your own AI visibility?</h2>
                            <p className="text-sm text-gray-400 mt-2">Create an account or request a guided audit from the Searchora team.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <Link href="/signup">
                                <Button icon={ArrowRight} iconPosition="right">Create account</Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="secondary">Request audit</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
