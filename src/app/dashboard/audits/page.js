'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, Plus, Calendar, Zap, ArrowLeft, Eye, FileText,
    CheckCircle2, AlertTriangle, TrendingUp, Target, HelpCircle,
    BookOpen, Layers, Shield, Search,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getUserAuditsFromStore } from '@/lib/firestoreAudit';
import { useI18n } from '@/lib/i18n';

/* ==================== SCORE LABEL ==================== */
function ScoreLabel({ score }) {
    const color = score >= 60 ? 'text-green-600 bg-green-50'
        : score >= 30 ? 'text-yellow-600 bg-yellow-50'
            : 'text-red-500 bg-red-50';
    return (
        <span className={`text-xl font-bold px-3 py-1 rounded-xl ${color}`}>{score}%</span>
    );
}

/* ==================== SUB-SCORE ITEM ==================== */
const subScoreIcons = {
    contentClarity: FileText,
    faqCoverage: HelpCircle,
    structuredAnswerReadiness: Layers,
    topicalAuthority: BookOpen,
    comparisonContent: Target,
    educationalDepth: TrendingUp,
    technicalReadiness: Shield,
};

function SubScoreRow({ label, value, icon: Icon }) {
    const color = value >= 60 ? 'bg-green-500' : value >= 30 ? 'bg-yellow-500' : 'bg-red-400';
    return (
        <div className="flex items-center gap-3">
            {Icon && <Icon className="w-4 h-4 text-text-muted shrink-0" />}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-text-secondary">{label}</span>
                    <span className="text-xs font-bold text-text-primary">{value}/100</span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-1.5">
                    <div className={`${color} rounded-full h-1.5 transition-all duration-500`}
                        style={{ width: `${value}%` }} />
                </div>
            </div>
        </div>
    );
}

/* ==================== AUDIT DETAIL VIEW ==================== */
function AuditDetail({ audit, onBack, t }) {
    const subScores = audit.subScores || {};
    const subScoreLabels = {
        contentClarity: 'Content Clarity',
        faqCoverage: 'FAQ Coverage',
        structuredAnswerReadiness: 'Answer Readiness',
        topicalAuthority: 'Topical Authority',
        comparisonContent: 'Comparison Content',
        educationalDepth: 'Educational Depth',
        technicalReadiness: 'Technical Readiness',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack}
                        className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center hover:bg-surface-secondary/80 transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4 text-text-muted" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">{audit.companyName || audit.website}</h1>
                        <p className="text-xs text-text-muted">{audit.website} · {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : ''}</p>
                    </div>
                </div>
                <ScoreLabel score={audit.visibilityScore || 0} />
            </div>

            {/* Score + breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card hover={false} padding="p-6">
                    <h3 className="text-xs font-semibold text-brand uppercase tracking-wider mb-4">AI Visibility Score</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl font-bold text-brand">{audit.visibilityScore || 0}%</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-text-secondary">{audit.scoreExplanation || ''}</p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="text-center p-2 bg-surface-secondary rounded-xl">
                            <p className="text-lg font-bold text-text-primary">{audit.pagesCrawled || 0}</p>
                            <p className="text-[10px] text-text-muted">Pages</p>
                        </div>
                        <div className="text-center p-2 bg-surface-secondary rounded-xl">
                            <p className="text-lg font-bold text-text-primary">{(audit.recommendations || []).length}</p>
                            <p className="text-[10px] text-text-muted">Actions</p>
                        </div>
                        <div className="text-center p-2 bg-surface-secondary rounded-xl">
                            <p className="text-lg font-bold text-text-primary">{audit.provider || '—'}</p>
                            <p className="text-[10px] text-text-muted">Engine</p>
                        </div>
                    </div>
                </Card>

                <Card hover={false} padding="p-6">
                    <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Score Breakdown</h3>
                    <div className="space-y-3">
                        {Object.entries(subScoreLabels).map(([key, label]) => (
                            <SubScoreRow
                                key={key}
                                label={label}
                                value={subScores[key] || 0}
                                icon={subScoreIcons[key]}
                            />
                        ))}
                    </div>
                </Card>
            </div>

            {/* Executive Summary */}
            {audit.executiveReport && (
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-brand" /> Executive Summary
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{audit.executiveReport}</p>
                </Card>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid lg:grid-cols-2 gap-6">
                {(audit.strengths || []).length > 0 && (
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-green-600 mb-3">{t('audit.strengths')}</h3>
                        <div className="space-y-2">
                            {audit.strengths.map((s, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-text-secondary">{s}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
                {(audit.weaknesses || []).length > 0 && (
                    <Card hover={false} padding="p-6">
                        <h3 className="text-sm font-semibold text-red-500 mb-3">{t('audit.weaknesses')}</h3>
                        <div className="space-y-2">
                            {audit.weaknesses.map((w, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-text-secondary">{w}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Recommendations */}
            {(audit.recommendations || []).length > 0 && (
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">{t('dashboard.recommendations')}</h3>
                    <div className="space-y-2">
                        {audit.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                                <span className="text-xs font-bold text-brand bg-brand-50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <div className="flex-1">
                                    <p className="text-sm text-text-primary">{rec.title}</p>
                                    {rec.details && <p className="text-xs text-text-muted mt-0.5">{rec.details}</p>}
                                    {rec.impact && <p className="text-xs text-green-600 mt-0.5">{rec.impact}</p>}
                                </div>
                                {rec.priority && (
                                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${rec.priority === 'high' ? 'bg-red-50 text-red-500' :
                                        rec.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'
                                        }`}>{rec.priority}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Priority Actions */}
            {(audit.priorityActions || []).length > 0 && (
                <Card hover={false} padding="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-brand" /> Priority Actions
                    </h3>
                    <div className="space-y-2">
                        {audit.priorityActions.map((action, i) => (
                            <div key={i} className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl">
                                <p className="text-sm font-medium text-text-primary">{action.action}</p>
                                <div className="flex gap-4 mt-1">
                                    {action.expectedImpact && (
                                        <span className="text-xs text-green-600">↑ {action.expectedImpact}</span>
                                    )}
                                    {action.timeframe && (
                                        <span className="text-xs text-text-muted">⏱ {action.timeframe}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

/* ==================== MAIN AUDITS PAGE ==================== */
export default function AuditsPage() {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const { user } = useAuth();
    const { t } = useI18n();

    useEffect(() => {
        async function fetchAudits() {
            if (!user) { setLoading(false); return; }
            try {
                const data = await getUserAuditsFromStore(user.uid, 50);
                setAudits(data);
            } catch (err) {
                console.error('Error fetching audits:', err);
            }
            setLoading(false);
        }
        fetchAudits();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Detail view
    if (selectedAudit) {
        return <AuditDetail audit={selectedAudit} onBack={() => setSelectedAudit(null)} t={t} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.audits')}</h1>
                    <p className="text-sm text-text-secondary mt-0.5">
                        {audits.length > 0 ? `${audits.length} audit${audits.length > 1 ? 's' : ''}` : ''}
                    </p>
                </div>
                <Link href="/dashboard/audit">
                    <Button size="sm" icon={Plus}>{t('dashboard.runNewAudit')}</Button>
                </Link>
            </div>

            {audits.length === 0 ? (
                <Card hover={false} padding="p-12" className="text-center">
                    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {t('dashboard.runNewAudit')}
                    </h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                        {t('audit.subtitle')}
                    </p>
                    <Link href="/dashboard/audit">
                        <Button icon={Plus}>{t('dashboard.runNewAudit')}</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-3">
                    {audits.map((audit) => (
                        <Card key={audit.id} padding="p-5"
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedAudit(audit)}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary">
                                            {audit.companyName || audit.website || 'Audit'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-text-muted">{audit.website}</span>
                                            <span className="text-xs text-text-muted">·</span>
                                            <span className="text-xs text-text-muted flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : '—'}
                                            </span>
                                            <span className="text-xs text-text-muted">·</span>
                                            <span className="text-xs text-text-muted">{audit.pagesCrawled || 0} pages</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ScoreLabel score={audit.visibilityScore || 0} />
                                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                        {t('audit.complete')}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
