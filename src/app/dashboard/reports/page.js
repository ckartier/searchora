'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Zap, BarChart3, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ReportsPage() {
    const { user } = useAuth();
    const { t } = useI18n();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        async function loadReports() {
            if (!user?.uid) { setLoading(false); return; }
            try {
                // Load reports from audits (each audit generates a report)
                const q = query(
                    collection(db, 'audits'),
                    where('userId', '==', user.uid),
                );
                const snap = await getDocs(q);
                const auditReports = snap.docs.map((d) => {
                    const data = d.data();
                    const date = data.createdAt?.toDate?.()
                        ? data.createdAt.toDate()
                        : new Date(data.createdAt || Date.now());
                    return {
                        id: d.id,
                        title: `Audit Report — ${data.companyName || data.website || 'Website'}`,
                        type: 'Audit',
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        dateRaw: date,
                        website: data.website || '',
                        score: data.visibilityScore || 0,
                        summary: data.summary || '',
                        executiveReport: data.executiveReport || '',
                        strengths: data.strengths || [],
                        weaknesses: data.weaknesses || [],
                        opportunities: data.opportunities || [],
                        recommendations: data.recommendations || [],
                        priorityActions: data.priorityActions || [],
                        pagesCrawled: data.pagesCrawled || 0,
                    };
                });

                // Load presence test reports
                const pq = query(
                    collection(db, 'presence_tests'),
                    where('userId', '==', user.uid),
                );
                const psnap = await getDocs(pq).catch(() => ({ docs: [] }));
                const presenceReports = psnap.docs.map((d) => {
                    const data = d.data();
                    const date = data.createdAt?.toDate?.()
                        ? data.createdAt.toDate()
                        : new Date(data.createdAt || Date.now());
                    return {
                        id: d.id,
                        title: `Presence Test — ${data.domain || 'Domain'}`,
                        type: 'Presence',
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        dateRaw: date,
                        domain: data.domain || '',
                        presenceRate: data.presenceRate || 0,
                        totalMentions: data.totalMentions || 0,
                        promptCount: data.promptCount || 0,
                        competitorLeaderboard: data.competitorLeaderboard || [],
                    };
                });

                // Combine and sort by date
                const all = [...auditReports, ...presenceReports]
                    .sort((a, b) => b.dateRaw - a.dateRaw);
                setReports(all);
            } catch (err) {
                console.error('Error loading reports:', err);
            }
            setLoading(false);
        }
        loadReports();
    }, [user?.uid]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Expanded report view
    if (selectedReport) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{selectedReport.title}</h1>
                        <p className="text-sm text-text-secondary mt-0.5">{selectedReport.date}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setSelectedReport(null)}>
                        ← Back to reports
                    </Button>
                </div>

                {selectedReport.type === 'Audit' ? (
                    <div className="space-y-4">
                        {/* Score */}
                        <Card hover={false} padding="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
                                    <span className="text-2xl font-bold text-brand">{selectedReport.score}%</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">{selectedReport.website}</h3>
                                    <p className="text-sm text-text-muted">{selectedReport.pagesCrawled} pages crawled</p>
                                </div>
                            </div>
                        </Card>

                        {/* Executive summary */}
                        {selectedReport.executiveReport && (
                            <Card hover={false} padding="p-6">
                                <h3 className="text-sm font-semibold text-text-primary mb-3">Executive Summary</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{selectedReport.executiveReport}</p>
                            </Card>
                        )}

                        {/* Strengths & Weaknesses */}
                        <div className="grid lg:grid-cols-2 gap-4">
                            {selectedReport.strengths.length > 0 && (
                                <Card hover={false} padding="p-6">
                                    <h3 className="text-sm font-semibold text-green-600 mb-3">Strengths</h3>
                                    <ul className="space-y-2">
                                        {selectedReport.strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">✓</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}
                            {selectedReport.weaknesses.length > 0 && (
                                <Card hover={false} padding="p-6">
                                    <h3 className="text-sm font-semibold text-red-500 mb-3">Weaknesses</h3>
                                    <ul className="space-y-2">
                                        {selectedReport.weaknesses.map((w, i) => (
                                            <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                                                <span className="text-red-400 mt-0.5">⚠</span> {w}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}
                        </div>

                        {/* Recommendations */}
                        {selectedReport.recommendations.length > 0 && (
                            <Card hover={false} padding="p-6">
                                <h3 className="text-sm font-semibold text-text-primary mb-3">Recommendations</h3>
                                <div className="space-y-2">
                                    {selectedReport.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                                            <span className="text-xs font-bold text-brand bg-brand-50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">{i + 1}</span>
                                            <div>
                                                <p className="text-sm text-text-primary">{rec.title}</p>
                                                {rec.impact && <p className="text-xs text-text-muted mt-0.5">{rec.impact}</p>}
                                            </div>
                                            {rec.priority && (
                                                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${rec.priority === 'high' ? 'bg-red-50 text-red-500' :
                                                    rec.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>{rec.priority}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Card hover={false} padding="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedReport.presenceRate >= 30 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <span className={`text-2xl font-bold ${selectedReport.presenceRate >= 30 ? 'text-green-600' : 'text-red-500'}`}>
                                        {selectedReport.presenceRate}%
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">{selectedReport.domain}</h3>
                                    <p className="text-sm text-text-muted">{selectedReport.promptCount} prompts · {selectedReport.totalMentions} mentions</p>
                                </div>
                            </div>
                        </Card>
                        {selectedReport.competitorLeaderboard?.length > 0 && (
                            <Card hover={false} padding="p-6">
                                <h3 className="text-sm font-semibold text-text-primary mb-3">Competitor Presence</h3>
                                {selectedReport.competitorLeaderboard.map((c) => (
                                    <div key={c.domain} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl mb-2">
                                        <span className="text-sm text-text-primary">{c.domain}</span>
                                        <span className="text-sm font-bold">{c.presenceRate}%</span>
                                    </div>
                                ))}
                            </Card>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
                <p className="text-sm text-text-secondary mt-0.5">
                    {reports.length > 0 ? `${reports.length} report${reports.length > 1 ? 's' : ''}` : 'No reports yet'}
                </p>
            </div>

            {reports.length === 0 ? (
                <Card hover={false} padding="p-12" className="text-center">
                    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No reports yet</h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                        Run an audit or a presence test to generate your first report.
                    </p>
                    <Link href="/dashboard/audit">
                        <Button icon={Zap}>Run an audit</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => (
                        <Card key={report.id} padding="p-5"
                            className="cursor-pointer"
                            onClick={() => setSelectedReport(report)}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.type === 'Audit' ? 'bg-brand-50' : 'bg-blue-50'
                                        }`}>
                                        {report.type === 'Audit'
                                            ? <BarChart3 className="w-5 h-5 text-brand" />
                                            : <TrendingUp className="w-5 h-5 text-blue-500" />
                                        }
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary">{report.title}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-text-muted flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {report.date}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${report.type === 'Audit'
                                        ? 'text-brand bg-brand-50'
                                        : 'text-blue-600 bg-blue-50'
                                        }`}>
                                        {report.type}
                                    </span>
                                    {report.type === 'Audit' && (
                                        <span className="text-sm font-bold text-brand">{report.score}%</span>
                                    )}
                                    {report.type === 'Presence' && (
                                        <span className={`text-sm font-bold ${report.presenceRate >= 30 ? 'text-green-600' : 'text-red-500'}`}>
                                            {report.presenceRate}%
                                        </span>
                                    )}
                                    <Button variant="ghost" size="sm" icon={Eye}>View</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
