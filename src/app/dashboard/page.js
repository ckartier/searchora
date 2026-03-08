'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    BarChart3,
    FileText,
    Eye,
    Zap,
    ArrowRight,
    Plus,
    RefreshCw,
    Search,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getUserAuditsFromStore } from '@/lib/firestoreAudit';

/* ===================== STAT CARD ===================== */
function StatCard({ label, value, icon: Icon }) {
    return (
        <Card hover={false} padding="p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-brand" />
                </div>
            </div>
            <div className="text-2xl font-bold text-text-primary">{value}</div>
            <div className="text-xs text-text-muted mt-0.5">{label}</div>
        </Card>
    );
}

/* ===================== EMPTY DASHBOARD STATE ===================== */
function EmptyDashboard({ t }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={t('dashboard.visibilityScore')} value="—" icon={Eye} />
                <StatCard label={t('dashboard.trackedPages')} value="0" icon={FileText} />
                <StatCard label={t('dashboard.aiCitations')} value="0" icon={BarChart3} />
                <StatCard label={t('dashboard.promptsMonitored')} value="0" icon={Search} />
            </div>

            <Card hover={false} padding="p-10">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Zap className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Run your first audit
                    </h3>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        Start by auditing your website. Our crawler will analyze your pages, score your
                        AI visibility, and provide actionable recommendations.
                    </p>
                    <Link href="/dashboard/audit">
                        <Button icon={ArrowRight} iconPosition="right">
                            {t('dashboard.runNewAudit')}
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}

/* ===================== DASHBOARD WITH DATA ===================== */
function DashboardWithData({ audits, t }) {
    const latestAudit = audits[0];
    const score = latestAudit?.visibilityScore || 0;
    const pagesCrawled = latestAudit?.pagesCrawled || 0;
    const recommendations = latestAudit?.recommendations || [];

    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('dashboard.visibilityScore')}
                    value={`${score}%`}
                    icon={Eye}
                />
                <StatCard
                    label={t('dashboard.trackedPages')}
                    value={pagesCrawled}
                    icon={FileText}
                />
                <StatCard
                    label="Audits"
                    value={audits.length}
                    icon={BarChart3}
                />
                <StatCard
                    label={t('dashboard.recommendations')}
                    value={recommendations.length}
                    icon={Search}
                />
            </div>

            {/* Latest audit summary */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card hover={false} padding="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-text-primary">Latest Audit</h3>
                        <Clock className="w-4 h-4 text-text-muted" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
                                <span className="text-xl font-bold text-brand">{score}%</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    {latestAudit?.companyName || latestAudit?.website}
                                </p>
                                <p className="text-xs text-text-secondary">{latestAudit?.website}</p>
                                <p className="text-xs text-text-muted mt-1">
                                    {pagesCrawled} pages crawled · {latestAudit?.industry || ''}
                                </p>
                            </div>
                        </div>

                        {latestAudit?.summary && (
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {latestAudit.summary}
                            </p>
                        )}

                        {/* Strengths */}
                        {latestAudit?.strengths?.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-green-600 mb-2">{t('audit.strengths')}</p>
                                <div className="space-y-1">
                                    {latestAudit.strengths.slice(0, 3).map((s, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-secondary">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Top recommendations */}
                <Card hover={false} padding="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.recommendations')}</h3>
                        <span className="text-xs text-text-muted">{recommendations.length} items</span>
                    </div>
                    <div className="space-y-2">
                        {recommendations.slice(0, 5).map((rec, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-secondary transition-colors"
                            >
                                <div className="w-6 h-6 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-brand">{i + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary">{rec.title}</p>
                                    {rec.reason && (
                                        <p className="text-[10px] text-text-muted mt-0.5">{rec.reason}</p>
                                    )}
                                </div>
                                {rec.priority && (
                                    <span
                                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${rec.priority === 'high'
                                                ? 'bg-red-50 text-red-500'
                                                : rec.priority === 'medium'
                                                    ? 'bg-yellow-50 text-yellow-600'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {rec.priority}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Audit history */}
            <Card hover={false} padding="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.audits')}</h3>
                    <span className="text-xs text-text-muted">{audits.length} total</span>
                </div>
                <div className="space-y-2">
                    {audits.slice(0, 5).map((audit, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-secondary transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-text-primary">
                                        {audit.companyName || audit.website}
                                    </p>
                                    <p className="text-[10px] text-text-muted">{audit.website}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold text-text-primary">
                                    {audit.visibilityScore}%
                                </span>
                                <p className="text-[10px] text-text-muted">{t('common.score')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

/* ===================== MAIN DASHBOARD PAGE ===================== */
export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useI18n();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAudits() {
            if (user?.uid) {
                try {
                    const data = await getUserAuditsFromStore(user.uid);
                    setAudits(data);
                } catch (err) {
                    console.error('Error loading audits:', err);
                }
            }
            setLoading(false);
        }
        loadAudits();
    }, [user]);

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>
                    <p className="text-sm text-text-secondary mt-0.5">
                        {t('dashboard.welcome')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        onClick={() => window.location.reload()}
                    >
                        {t('dashboard.refresh')}
                    </Button>
                    <Link href="/dashboard/audit">
                        <Button size="sm" icon={Plus}>
                            {t('dashboard.runNewAudit')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : audits.length === 0 ? (
                <EmptyDashboard t={t} />
            ) : (
                <DashboardWithData audits={audits} t={t} />
            )}
        </div>
    );
}
