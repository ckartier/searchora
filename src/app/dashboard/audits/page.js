'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Plus, Calendar, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getUserAuditsFromStore } from '@/lib/firestoreAudit';
import { useI18n } from '@/lib/i18n';

export default function AuditsPage() {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
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
                        <Card key={audit.id} padding="p-5" className="cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary">
                                            {audit.website || audit.companyName || 'Audit'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-text-muted flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : '—'}
                                            </span>
                                            {audit.pagesAnalyzed && (
                                                <>
                                                    <span className="text-xs text-text-muted">·</span>
                                                    <span className="text-xs text-text-muted">{audit.pagesAnalyzed} {t('common.pages')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {audit.visibilityScore != null && (
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-brand">{audit.visibilityScore}%</div>
                                            <div className="text-[10px] text-text-muted">{t('dashboard.visibilityScore')}</div>
                                        </div>
                                    )}
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
