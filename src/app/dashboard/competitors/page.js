'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getUserAuditsFromStore } from '@/lib/firestoreAudit';
import { useI18n } from '@/lib/i18n';

export default function CompetitorsPage() {
    const [competitors, setCompetitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { t } = useI18n();

    useEffect(() => {
        async function fetchCompetitors() {
            if (!user) { setLoading(false); return; }
            try {
                const audits = await getUserAuditsFromStore(user.uid, 50);
                // Extract competitors from audit data
                const compMap = new Map();
                for (const a of audits) {
                    if (a.competitors && Array.isArray(a.competitors)) {
                        for (const c of a.competitors) {
                            const name = c.name || c.domain || c;
                            if (name && !compMap.has(name)) {
                                compMap.set(name, {
                                    name: typeof c === 'string' ? c : (c.name || c.domain),
                                    domain: typeof c === 'string' ? c : (c.domain || c.name),
                                    score: c.score || 0,
                                    citations: c.citations || 0,
                                });
                            }
                        }
                    }
                }
                setCompetitors(Array.from(compMap.values()));
            } catch (err) {
                console.error('Error fetching competitors:', err);
            }
            setLoading(false);
        }
        fetchCompetitors();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.competitors')}</h1>
                    <p className="text-sm text-text-secondary mt-0.5">
                        {competitors.length > 0 ? `${competitors.length} tracked` : ''}
                    </p>
                </div>
                <Link href="/dashboard/audit">
                    <Button size="sm" icon={Plus}>{t('dashboard.runNewAudit')}</Button>
                </Link>
            </div>

            {competitors.length === 0 ? (
                <Card hover={false} padding="p-12" className="text-center">
                    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {t('dashboard.competitors')}
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
                    {competitors.map((comp) => (
                        <Card key={comp.name} padding="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-surface-secondary rounded-xl flex items-center justify-center">
                                        <Target className="w-5 h-5 text-text-muted" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary">{comp.name}</h3>
                                        <span className="text-xs text-text-muted">{comp.domain}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {comp.score > 0 && (
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-text-primary">{comp.score}%</div>
                                            <div className="text-[10px] text-text-muted">{t('common.score')}</div>
                                        </div>
                                    )}
                                    {comp.citations > 0 && (
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-text-primary">{comp.citations}</div>
                                            <div className="text-[10px] text-text-muted">Citations</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
