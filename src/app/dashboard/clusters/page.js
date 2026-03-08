'use client';

import { useState, useEffect } from 'react';
import {
    Layers, Sparkles, Plus, Trash2, Globe, Target, BookOpen,
    HelpCircle, Scale, FileText, Zap, ArrowRight, ChevronDown,
    ChevronUp, Link2, ListOrdered, Star, Loader2, RefreshCw,
    CheckCircle2, AlertCircle, Crown,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import {
    collection, addDoc, getDocs, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/* ==================== PAGE TYPE ICONS ==================== */
const pageTypeConfig = {
    guide: { icon: BookOpen, color: 'text-blue-600 bg-blue-50', label: 'Guide' },
    comparison: { icon: Scale, color: 'text-purple-600 bg-purple-50', label: 'Comparison' },
    definition: { icon: FileText, color: 'text-teal-600 bg-teal-50', label: 'Definition' },
    faq: { icon: HelpCircle, color: 'text-orange-600 bg-orange-50', label: 'FAQ' },
    'use-case': { icon: Target, color: 'text-green-600 bg-green-50', label: 'Use Case' },
    decision: { icon: Star, color: 'text-yellow-600 bg-yellow-50', label: 'Decision' },
};

/* ==================== PRIORITY BADGE ==================== */
function PriorityBadge({ priority }) {
    const colors = {
        high: 'bg-red-50 text-red-600 border-red-200',
        medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        low: 'bg-gray-50 text-gray-500 border-gray-200',
    };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[priority] || colors.medium}`}>
            {priority}
        </span>
    );
}

/* ==================== CLUSTER CARD ==================== */
function ClusterCard({ cluster, index }) {
    const [expanded, setExpanded] = useState(false);
    const [showLinks, setShowLinks] = useState(false);
    const [showOrder, setShowOrder] = useState(false);

    const pillarType = pageTypeConfig[cluster.pillarPage?.type] || pageTypeConfig.guide;
    const PillarIcon = pillarType.icon;

    return (
        <Card hover={false} padding="p-0" className="overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-border/50">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-text-primary capitalize">{cluster.theme}</h3>
                                <PriorityBadge priority={cluster.priority} />
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">
                                {1 + (cluster.supportingPages?.length || 0)} pages · Cluster #{index + 1}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setExpanded(!expanded)}
                        className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer">
                        {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                    </button>
                </div>

                {/* Why this matters */}
                <div className="mt-3 grid sm:grid-cols-3 gap-2">
                    <div className="p-2 bg-surface-secondary rounded-lg">
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Strategy</p>
                        <p className="text-xs text-text-secondary mt-0.5">{cluster.reason}</p>
                    </div>
                    <div className="p-2 bg-surface-secondary rounded-lg">
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">AI Value</p>
                        <p className="text-xs text-text-secondary mt-0.5">{cluster.aiValue}</p>
                    </div>
                    <div className="p-2 bg-surface-secondary rounded-lg">
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Commercial</p>
                        <p className="text-xs text-text-secondary mt-0.5">{cluster.commercialRelevance || '—'}</p>
                    </div>
                </div>
            </div>

            {/* Pillar Page */}
            <div className="px-5 py-3 bg-brand-50/30 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <Crown className="w-4 h-4 text-brand shrink-0" />
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-brand uppercase tracking-wider">Pillar Page</p>
                        <p className="text-sm font-semibold text-text-primary">{cluster.pillarPage?.title}</p>
                        {cluster.pillarPage?.description && (
                            <p className="text-xs text-text-muted mt-0.5">{cluster.pillarPage.description}</p>
                        )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pillarType.color}`}>{pillarType.label}</span>
                </div>
            </div>

            {/* Supporting Pages (always visible) */}
            <div className="px-5 py-3">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Supporting Pages</p>
                <div className="space-y-1.5">
                    {(cluster.supportingPages || []).map((page, i) => {
                        const typeConfig = pageTypeConfig[page.type] || pageTypeConfig.guide;
                        const TypeIcon = typeConfig.icon;
                        return (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-secondary transition-colors">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${typeConfig.color}`}>
                                    <TypeIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary">{page.title}</p>
                                    {expanded && page.description && (
                                        <p className="text-xs text-text-muted mt-0.5">{page.description}</p>
                                    )}
                                    {expanded && page.role && (
                                        <p className="text-[10px] text-blue-500 mt-0.5">→ {page.role}</p>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeConfig.color}`}>{typeConfig.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Expanded sections */}
            {expanded && (
                <div className="border-t border-border/50">
                    {/* Internal linking */}
                    {cluster.internalLinkingPlan?.length > 0 && (
                        <div className="px-5 py-3 border-b border-border/50">
                            <button onClick={() => setShowLinks(!showLinks)}
                                className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer w-full">
                                <Link2 className="w-4 h-4 text-blue-500" />
                                Internal Linking Plan
                                <span className="text-xs text-text-muted ml-auto">{cluster.internalLinkingPlan.length} rules</span>
                            </button>
                            {showLinks && (
                                <ul className="mt-2 space-y-1">
                                    {cluster.internalLinkingPlan.map((link, i) => (
                                        <li key={i} className="text-xs text-text-secondary flex items-start gap-2 pl-6">
                                            <ArrowRight className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                                            {link}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Publishing order */}
                    {cluster.recommendedPublishingOrder?.length > 0 && (
                        <div className="px-5 py-3">
                            <button onClick={() => setShowOrder(!showOrder)}
                                className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer w-full">
                                <ListOrdered className="w-4 h-4 text-green-500" />
                                Publishing Order
                                <span className="text-xs text-text-muted ml-auto">{cluster.recommendedPublishingOrder.length} steps</span>
                            </button>
                            {showOrder && (
                                <ol className="mt-2 space-y-1">
                                    {cluster.recommendedPublishingOrder.map((title, i) => (
                                        <li key={i} className="text-xs text-text-secondary flex items-center gap-2 pl-6">
                                            <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                            {title}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

/* ==================== MAIN PAGE ==================== */
export default function ClustersPage() {
    const { user } = useAuth();

    // Form
    const [domain, setDomain] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [themes, setThemes] = useState(['', '', '']);
    const [trackedPrompts, setTrackedPrompts] = useState(['', '']);

    // State
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    // Load profile + history
    useEffect(() => {
        async function load() {
            if (!user?.uid) return;
            try {
                const { getDoc, doc } = await import('firebase/firestore');
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.companyName) setCompanyName(data.companyName);
                    if (data.website) setDomain(data.website);
                    if (data.industry) setIndustry(data.industry);
                }
            } catch { }

            // Load history
            try {
                const q = query(collection(db, 'content_clusters'), where('userId', '==', user.uid));
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
            } catch { }
        }
        load();
    }, [user?.uid]);

    const addField = (setter, current) => setter([...current, '']);
    const removeField = (setter, current, i) => setter(current.filter((_, idx) => idx !== i));
    const updateField = (setter, current, i, val) => {
        const u = [...current]; u[i] = val; setter(u);
    };

    /* ==================== GENERATE ==================== */
    const generate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const resp = await fetch('/api/generate-clusters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain,
                    companyName,
                    industry,
                    themes: themes.filter(Boolean),
                    trackedPrompts: trackedPrompts.filter(Boolean),
                }),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || 'Generation failed');
            }

            const data = await resp.json();
            setResult(data.data);

            // Save to Firestore
            if (user?.uid && data.data?.clusters) {
                try {
                    await addDoc(collection(db, 'content_clusters'), {
                        userId: user.uid,
                        domain,
                        companyName,
                        industry,
                        themes: data.data.inputThemes || [],
                        clusterCount: data.data.clusterCount,
                        totalPages: data.data.totalPages,
                        clusters: data.data.clusters.map(c => ({
                            theme: c.theme,
                            priority: c.priority,
                            pillarTitle: c.pillarPage?.title || '',
                            pageCount: 1 + (c.supportingPages?.length || 0),
                        })),
                        createdAt: serverTimestamp(),
                    });
                } catch (saveErr) {
                    console.error('Failed to save clusters:', saveErr);
                }
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    /* ==================== LOADING ==================== */
    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 py-10">
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <div className="animate-spin"><Layers className="w-8 h-8 text-brand" /></div>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">Generating Clusters...</h2>
                    <p className="text-sm text-text-secondary">
                        AI is analyzing your themes and creating strategic content clusters
                    </p>
                </div>
                <Card hover={false} padding="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                        <span className="text-sm text-text-secondary">
                            Building pillar pages, supporting content, linking plans and publishing orders...
                        </span>
                    </div>
                </Card>
            </div>
        );
    }

    /* ==================== RESULTS ==================== */
    if (result) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Content Clusters</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            {result.companyName || result.website} · {result.clusterCount} cluster{result.clusterCount > 1 ? 's' : ''} · {result.totalPages} pages
                        </p>
                    </div>
                    <Button variant="secondary" size="sm" icon={RefreshCw}
                        onClick={() => setResult(null)}>
                        New Generation
                    </Button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card hover={false} padding="p-4">
                        <Layers className="w-5 h-5 text-brand mb-2" />
                        <div className="text-2xl font-bold text-text-primary">{result.clusterCount}</div>
                        <div className="text-[10px] text-text-muted">Clusters</div>
                    </Card>
                    <Card hover={false} padding="p-4">
                        <FileText className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-text-primary">{result.totalPages}</div>
                        <div className="text-[10px] text-text-muted">Total Pages</div>
                    </Card>
                    <Card hover={false} padding="p-4">
                        <Zap className="w-5 h-5 text-green-500 mb-2" />
                        <div className="text-2xl font-bold text-text-primary">
                            {result.clusters?.filter(c => c.priority === 'high').length || 0}
                        </div>
                        <div className="text-[10px] text-text-muted">High Priority</div>
                    </Card>
                </div>

                {/* Clusters */}
                <div className="space-y-4">
                    {(result.clusters || []).map((cluster, i) => (
                        <ClusterCard key={i} cluster={cluster} index={i} />
                    ))}
                </div>
            </div>
        );
    }

    /* ==================== FORM ==================== */
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Content Clusters</h1>
                <p className="text-sm text-text-secondary mt-1">
                    Generate strategic topic clusters to boost your brand's AI answer visibility.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left — Brand + Themes */}
                <div className="space-y-6">
                    <Card hover={false} padding="p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Brand Info</h3>
                        <div className="space-y-3">
                            <Input label="Domain" placeholder="prophot.com" icon={Globe}
                                value={domain} onChange={e => setDomain(e.target.value)} />
                            <Input label="Company" placeholder="ProPhot"
                                value={companyName} onChange={e => setCompanyName(e.target.value)} />
                            <Input label="Industry" placeholder="Photography"
                                value={industry} onChange={e => setIndustry(e.target.value)} />
                        </div>
                    </Card>

                    <Card hover={false} padding="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-text-primary">Strategic Themes</h3>
                            <button onClick={() => addField(setThemes, themes)}
                                className="text-xs text-brand font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>
                        <p className="text-xs text-text-muted mb-3">Topics to build clusters around</p>
                        <div className="space-y-2">
                            {themes.map((t, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input placeholder="e.g. portrait lighting"
                                        value={t} onChange={e => updateField(setThemes, themes, i, e.target.value)}
                                        className="flex-1" />
                                    {themes.length > 1 && (
                                        <button onClick={() => removeField(setThemes, themes, i)}
                                            className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right — Prompts + Generate */}
                <div className="space-y-6">
                    <Card hover={false} padding="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-text-primary">Tracked Prompts</h3>
                            <button onClick={() => addField(setTrackedPrompts, trackedPrompts)}
                                className="text-xs text-brand font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>
                        <p className="text-xs text-text-muted mb-3">AI queries to target</p>
                        <div className="space-y-2">
                            {trackedPrompts.map((p, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input placeholder="best studio flash for portraits"
                                        value={p} onChange={e => updateField(setTrackedPrompts, trackedPrompts, i, e.target.value)}
                                        className="flex-1" />
                                    {trackedPrompts.length > 1 && (
                                        <button onClick={() => removeField(setTrackedPrompts, trackedPrompts, i)}
                                            className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Button size="lg" icon={Sparkles} onClick={generate}
                        disabled={!domain && themes.filter(Boolean).length === 0}
                        className="w-full shadow-[0_4px_16px_rgba(249,115,22,0.3)]">
                        Generate Clusters ({themes.filter(Boolean).length} themes)
                    </Button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                    )}

                    {/* History */}
                    {history.length > 0 && (
                        <Card hover={false} padding="p-5">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Generations</h3>
                            <div className="space-y-2">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Layers className="w-4 h-4 text-brand shrink-0" />
                                            <div>
                                                <p className="text-sm text-text-primary">{item.companyName || item.domain}</p>
                                                <p className="text-[10px] text-text-muted">
                                                    {item.clusterCount} cluster{item.clusterCount > 1 ? 's' : ''} · {item.totalPages} pages
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
