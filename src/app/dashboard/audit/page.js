'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    ArrowLeft,
    Globe,
    Building2,
    Target,
    CheckCircle2,
    Loader2,
    Zap,
    BarChart3,
    FileText,
    MessageSquare,
    Search,
    AlertTriangle,
    TrendingUp,
    Eye,
    Shield,
    HelpCircle,
    BookOpen,
    Scale,
    Layers,
    Sparkles,
    ArrowUpRight,
    Clock,
    MapPin,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { saveFullAudit } from '@/lib/firestoreAudit';

const industries = [
    'SaaS / Software', 'E-commerce', 'Financial Services', 'Healthcare',
    'Marketing / Agency', 'Real Estate', 'Education', 'Travel / Hospitality',
    'Legal', 'Consulting', 'Manufacturing', 'Other',
];
const countries = [
    'United States', 'United Kingdom', 'Canada', 'France', 'Germany',
    'Australia', 'Netherlands', 'Spain', 'Italy', 'Other',
];

/* ==================== SUB-SCORE BAR ==================== */
function SubScoreBar({ label, value, icon: Icon }) {
    const color =
        value >= 60 ? 'bg-green-500' : value >= 30 ? 'bg-yellow-500' : 'bg-red-400';
    return (
        <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-text-muted shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary truncate">{label}</span>
                    <span className="text-xs font-semibold text-text-primary">{value}</span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-1.5">
                    <div
                        className={`${color} rounded-full h-1.5 transition-all duration-700`}
                        style={{ width: `${value}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

/* ==================== MAIN COMPONENT ==================== */
export default function AuditPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState([]);
    const [form, setForm] = useState({
        websiteUrl: '',
        companyName: '',
        competitors: ['', '', ''],
        industry: '',
        country: '',
    });

    const router = useRouter();
    const { user } = useAuth();
    const progressRef = useRef(null);

    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.scrollTop = progressRef.current.scrollHeight;
        }
    }, [progress]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCompetitorChange = (i, value) =>
        setForm((prev) => {
            const c = [...prev.competitors];
            c[i] = value;
            return { ...prev, competitors: c };
        });

    /* ==================== RUN AUDIT ==================== */
    const runAudit = async () => {
        setLoading(true);
        setError(null);
        setProgress([]);

        const log = (msg, type = 'info') =>
            setProgress((p) => [...p, { msg, type, time: new Date().toLocaleTimeString() }]);

        try {
            log('Starting Searchora audit pipeline...');
            log(`Website: ${form.websiteUrl}`);
            log(`Company: ${form.companyName}`);
            if (form.industry) log(`Industry: ${form.industry}`);
            log('Phase 1: Crawling website pages...');

            const resp = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    websiteUrl: form.websiteUrl,
                    companyName: form.companyName,
                    industry: form.industry,
                    country: form.country,
                    competitors: form.competitors.filter(Boolean),
                    maxPages: 30,
                    maxDepth: 2,
                    userId: user?.uid || null,
                }),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || 'Audit failed');
            }

            const data = await resp.json();
            setResult(data.audit);

            log(`✓ Crawled ${data.audit.crawl?.pagesCrawled || 0} pages`, 'success');
            log(`✓ AI visibility score: ${data.audit.visibilityScore}/100`, 'success');
            log(`✓ ${data.audit.recommendations?.length || 0} recommendations generated`, 'success');
            log(`✓ ${data.audit.faqSuggestions?.length || 0} FAQ suggestions`, 'success');

            // Save to Firestore
            if (user?.uid && data.firestore) {
                log('Saving audit to Firestore...', 'info');
                try {
                    await saveFullAudit(user.uid, {
                        ...data.audit,
                        firestore: data.firestore,
                    });
                    log('✓ Audit saved to your account', 'success');
                } catch (saveErr) {
                    console.error('Firestore save error:', saveErr);
                    log('⚠ Could not save to account (audit still visible)', 'error');
                }
            }

            log('✓ Audit complete', 'success');
        } catch (err) {
            log(`✗ ${err.message}`, 'error');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ==================== LOADING STATE ==================== */
    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <div className="animate-spin"><Zap className="w-8 h-8 text-brand" /></div>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">
                        Running audit pipeline...
                    </h2>
                    <p className="text-sm text-text-secondary">
                        Crawling, extracting, scoring, and analyzing with AI
                    </p>
                </div>
                <Card hover={false} padding="p-0" className="overflow-hidden">
                    <div className="px-4 py-3 bg-surface-secondary border-b border-border flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-text-primary">Progress</span>
                    </div>
                    <div ref={progressRef} className="p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1.5">
                        {progress.map((p, i) => (
                            <div key={i} className={`flex items-start gap-2 ${p.type === 'success' ? 'text-green-600' :
                                p.type === 'error' ? 'text-red-500' : 'text-text-secondary'
                                }`}>
                                <span className="text-text-muted shrink-0">{p.time}</span>
                                <span>{p.msg}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 text-brand">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing...</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    /* ==================== RESULTS ==================== */
    if (result) {
        const audit = result;
        const crawl = audit.crawl || {};
        const sub = audit.subScores || {};

        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Audit Complete</h2>
                    <p className="text-sm text-text-secondary">
                        {crawl.pagesCrawled || 0} pages analyzed · {audit.companyName || audit.website}
                    </p>
                </div>

                {/* ---- SCORE + SUB-SCORES ---- */}
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Main score */}
                    <Card hover={false} padding="p-8" className="lg:col-span-2 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand mb-3">AI Visibility Score</p>
                        <div className="text-6xl font-bold text-text-primary mb-2">{audit.visibilityScore}%</div>
                        <div className="w-full bg-surface-secondary rounded-full h-3 mb-3">
                            <div className="bg-brand rounded-full h-3 transition-all duration-1000" style={{ width: `${audit.visibilityScore}%` }} />
                        </div>
                        <p className="text-xs text-text-secondary">{audit.scoreExplanation}</p>
                    </Card>

                    {/* Sub-scores */}
                    <Card hover={false} padding="p-6" className="lg:col-span-3">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">Score Breakdown</h3>
                        <div className="space-y-3">
                            <SubScoreBar label="Content Clarity" value={sub.contentClarity || 0} icon={FileText} />
                            <SubScoreBar label="FAQ Coverage" value={sub.faqCoverage || 0} icon={HelpCircle} />
                            <SubScoreBar label="Answer Readiness" value={sub.structuredAnswerReadiness || 0} icon={Zap} />
                            <SubScoreBar label="Topical Authority" value={sub.topicalAuthority || 0} icon={BookOpen} />
                            <SubScoreBar label="Comparison Content" value={sub.comparisonContent || 0} icon={Scale} />
                            <SubScoreBar label="Educational Depth" value={sub.educationalDepth || 0} icon={Layers} />
                            <SubScoreBar label="Technical Readiness" value={sub.technicalReadiness || 0} icon={Shield} />
                        </div>
                    </Card>
                </div>

                {/* ---- EXECUTIVE SUMMARY ---- */}
                <Card hover={false} padding="p-6" className="border-brand/20 bg-brand-50/20">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary mb-2">Executive Summary</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{audit.summary}</p>
                        </div>
                    </div>
                </Card>

                {/* ---- CRAWL STATS ---- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pages Crawled', value: crawl.pagesCrawled || 0, icon: BarChart3 },
                        { label: 'Avg Words/Page', value: crawl.siteSignals?.avgWordCount || 0, icon: FileText },
                        { label: 'Schema Adoption', value: `${crawl.siteSignals?.schemaAdoption || 0}%`, icon: Shield },
                        { label: 'FAQ Pages Found', value: crawl.siteSignals?.faqPages || 0, icon: HelpCircle },
                    ].map((s) => (
                        <Card key={s.label} hover={false} padding="p-4">
                            <s.icon className="w-4 h-4 text-brand mb-2" />
                            <div className="text-xl font-bold text-text-primary">{s.value}</div>
                            <div className="text-[10px] text-text-muted">{s.label}</div>
                        </Card>
                    ))}
                </div>

                {/* ---- STRENGTHS & WEAKNESSES ---- */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Strengths
                        </h3>
                        <ul className="space-y-2">
                            {(audit.strengths || []).map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />{s}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Weaknesses
                        </h3>
                        <ul className="space-y-2">
                            {(audit.weaknesses || []).map((w, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />{w}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* ---- PAGE TYPES ---- */}
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Page Types Discovered</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(crawl.pageTypes || {}).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl">
                                <span className="text-sm text-text-secondary capitalize">{type}</span>
                                <span className="text-sm font-bold text-text-primary">{count}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ---- CONTENT GAPS ---- */}
                {(crawl.contentGaps || []).length > 0 && (
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Content Gaps</h3>
                        <div className="space-y-2">
                            {crawl.contentGaps.map((gap, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${gap.severity === 'high' ? 'bg-red-50 text-red-500' :
                                        gap.severity === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'
                                        }`}>{gap.severity}</span>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{gap.title}</p>
                                        <p className="text-xs text-brand font-medium mt-0.5">→ {gap.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* ---- PRIORITY ACTIONS ---- */}
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Priority Actions</h3>
                    <div className="space-y-3">
                        {(audit.priorityActions || []).map((a, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                                <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-text-primary">{a.action}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-green-600 font-medium">{a.expectedImpact}</span>
                                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />{a.timeframe}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ---- RECOMMENDATIONS ---- */}
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">
                        Recommendations ({(audit.recommendations || []).length})
                    </h3>
                    <div className="space-y-2">
                        {(audit.recommendations || []).map((rec, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl">
                                <span className="text-xs font-bold text-brand w-6 text-center">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary">{rec.title}</p>
                                    {rec.details && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{rec.details}</p>}
                                </div>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${rec.priority === 'high' ? 'bg-red-50 text-red-500' :
                                    rec.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'
                                    }`}>{rec.priority}</span>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg shrink-0">{rec.impact}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ---- SUGGESTED PAGES ---- */}
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Suggested Pages to Create</h3>
                    <p className="text-xs text-text-muted mb-3">Based on crawl analysis and content gap detection.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {(audit.suggestedPages || []).map((page, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                                <FileText className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm text-text-primary">{page.title}</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">{page.reason}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-medium text-brand bg-brand-50 px-1.5 py-0.5 rounded capitalize">{page.type}</span>
                                        {page.priority && (
                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${page.priority === 'high' ? 'bg-red-50 text-red-500' :
                                                page.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-500'
                                                }`}>{page.priority}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ---- FAQ SUGGESTIONS ---- */}
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-1">FAQ Suggestions</h3>
                    <p className="text-xs text-text-muted mb-3">Questions your website should answer to improve AI visibility.</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {(audit.faqSuggestions || []).map((q, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-surface-secondary rounded-xl">
                                <MessageSquare className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" />
                                <p className="text-sm text-text-secondary">{q}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ---- COMPETITOR ANALYSIS ---- */}
                {(audit.competitorAnalysis || []).length > 0 && (
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Competitor Comparison</h3>
                        <div className="space-y-3">
                            {audit.competitorAnalysis.map((c, i) => (
                                <div key={i} className="p-4 bg-surface-secondary rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-4 h-4 text-text-muted" />
                                        <span className="text-sm font-semibold text-text-primary">{c.competitor}</span>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[10px] font-medium text-green-600 uppercase tracking-wider mb-1">Their advantage</p>
                                            <p className="text-sm text-text-secondary">{c.advantage}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-red-500 uppercase tracking-wider mb-1">Your gap</p>
                                            <p className="text-sm text-text-secondary">{c.gap}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* ---- EXECUTIVE REPORT ---- */}
                {audit.report && (
                    <Card hover={false} padding="p-6" className="border-gray-300">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Executive Report</h3>
                        <p className="text-sm text-text-secondary leading-relaxed mb-4">{audit.report.report}</p>
                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-red-50 rounded-xl">
                                <p className="text-[10px] font-medium text-red-500 uppercase tracking-wider mb-1">Biggest Issue</p>
                                <p className="text-sm text-text-primary">{audit.report.biggestIssue}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl">
                                <p className="text-[10px] font-medium text-green-600 uppercase tracking-wider mb-1">Best Opportunity</p>
                                <p className="text-sm text-text-primary">{audit.report.bestOpportunity}</p>
                            </div>
                        </div>
                        {audit.report.recommendedNextSteps?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Recommended Next Steps</p>
                                <ol className="space-y-1.5">
                                    {audit.report.recommendedNextSteps.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                            <span className="text-xs font-bold text-brand">{i + 1}.</span>{s}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </Card>
                )}

                {/* ---- CRAWLED PAGES ---- */}
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">
                        Crawled Pages ({crawl.pages?.length || 0})
                    </h3>
                    <div className="space-y-1.5 max-h-96 overflow-y-auto">
                        {(crawl.pages || [])
                            .sort((a, b) => (b.pageScore || 0) - (a.pageScore || 0))
                            .map((page, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${page.pageScore >= 50 ? 'bg-green-50 text-green-600' :
                                        page.pageScore >= 25 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
                                        }`}>{page.pageScore}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-text-primary truncate">{(() => { try { return new URL(page.url).pathname || '/'; } catch { return page.url; } })()}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            <span className="text-[10px] font-medium text-brand bg-brand-50 px-1.5 py-0.5 rounded capitalize">{page.pageType}</span>
                                            <span className="text-[10px] text-text-muted">{page.wordCount}w</span>
                                            {page.hasFAQ && <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded">FAQ</span>}
                                            {page.hasTable && <span className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded">Table</span>}
                                            {page.schemaTypes?.length > 0 && <span className="text-[10px] text-purple-600 bg-purple-50 px-1 rounded">Schema</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>

                {/* ---- ACTIONS ---- */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button size="lg" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                    <Button variant="secondary" size="lg" onClick={() => { setResult(null); setStep(1); }}>Run Another Audit</Button>
                </div>
            </div>
        );
    }

    /* ==================== FORM WIZARD ==================== */
    const totalSteps = 4;
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Run New Audit</h1>
                <p className="text-sm text-text-secondary mt-1">
                    Our crawler will analyze your website, extract content, and generate a full AI visibility report.
                </p>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex-1 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${s === step ? 'bg-brand text-white' : s < step ? 'bg-green-100 text-green-600' : 'bg-surface-secondary text-text-muted'
                            }`}>{s < step ? <CheckCircle2 className="w-4 h-4" /> : s}</div>
                        {s < totalSteps && <div className={`flex-1 h-0.5 rounded ${s < step ? 'bg-green-200' : 'bg-surface-tertiary'}`} />}
                    </div>
                ))}
            </div>

            <Card hover={false} padding="p-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-1">Website Details</h2>
                            <p className="text-sm text-text-secondary">Enter the website you want to audit.</p>
                        </div>
                        <Input label="Website URL" name="websiteUrl" placeholder="https://yourcompany.com" icon={Globe} value={form.websiteUrl} onChange={handleChange} required />
                        <Input label="Company Name" name="companyName" placeholder="Your Company" icon={Building2} value={form.companyName} onChange={handleChange} required />
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-1">Competitors</h2>
                            <p className="text-sm text-text-secondary">Add up to 3 competitor URLs (optional).</p>
                        </div>
                        {form.competitors.map((comp, i) => (
                            <Input key={i} label={`Competitor ${i + 1}`} placeholder="https://competitor.com" icon={Target} value={comp} onChange={(e) => handleCompetitorChange(i, e.target.value)} />
                        ))}
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-1">Industry & Region</h2>
                            <p className="text-sm text-text-secondary">More context improves analysis accuracy.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Industry</label>
                            <div className="grid grid-cols-2 gap-2">
                                {industries.map((ind) => (
                                    <button key={ind} onClick={() => setForm((p) => ({ ...p, industry: ind }))}
                                        className={`p-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${form.industry === ind ? 'border-brand bg-brand-50 text-brand' : 'border-border text-text-secondary hover:border-gray-300 hover:bg-surface-secondary'
                                            }`}>{ind}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Country</label>
                            <div className="grid grid-cols-2 gap-2">
                                {countries.map((c) => (
                                    <button key={c} onClick={() => setForm((p) => ({ ...p, country: c }))}
                                        className={`p-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${form.country === c ? 'border-brand bg-brand-50 text-brand' : 'border-border text-text-secondary hover:border-gray-300 hover:bg-surface-secondary'
                                            }`}>{c}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-1">Review & Launch</h2>
                            <p className="text-sm text-text-secondary">Confirm your details. The audit typically takes 30-60 seconds.</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                ['Website', form.websiteUrl], ['Company', form.companyName],
                                ['Industry', form.industry], ['Country', form.country],
                                ['Competitors', form.competitors.filter(Boolean).length || 'None'],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between p-3 bg-surface-secondary rounded-xl">
                                    <span className="text-sm text-text-secondary">{label}</span>
                                    <span className="text-sm font-medium text-text-primary">{val || '—'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                            <div className="flex items-start gap-3">
                                <Zap className="w-5 h-5 text-brand mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary">Full audit pipeline</p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Crawl pages → Extract content → Classify types → Score AI-readiness →
                                        Generate recommendations → Build executive report
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                )}

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                    <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)} disabled={step === 1}>Back</Button>
                    {step < totalSteps
                        ? <Button icon={ArrowRight} iconPosition="right" onClick={() => setStep(step + 1)} disabled={step === 1 && !form.websiteUrl}>Continue</Button>
                        : <Button icon={Zap} onClick={runAudit} disabled={!form.websiteUrl}>Run Audit</Button>
                    }
                </div>
            </Card>
        </div>
    );
}
