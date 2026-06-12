'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getUserAuditsFromStore } from '@/lib/firestoreAudit';
import { useI18n } from '@/lib/i18n';

export default function WebsitesPage() {
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { t } = useI18n();

    useEffect(() => {
        async function fetchWebsites() {
            if (!user) { setLoading(false); return; }
            try {
                const audits = await getUserAuditsFromStore(user.uid, 50);
                // Extract unique websites from audit data
                const siteMap = new Map();
                for (const a of audits) {
                    const domain = a.website || a.companyName || '';
                    if (domain && !siteMap.has(domain)) {
                        siteMap.set(domain, {
                            domain,
                            score: a.visibilityScore || 0,
                            pages: a.pagesAnalyzed || 0,
                            lastScan: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—',
                        });
                    }
                }
                setWebsites(Array.from(siteMap.values()));
            } catch (err) {
                console.error('Error fetching websites:', err);
            }
            setLoading(false);
        }
        fetchWebsites();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="orbit-loader"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.websites')}</h1>
                    <p className="text-sm text-text-secondary mt-0.5">
                        {websites.length > 0 ? `${websites.length} site${websites.length > 1 ? 's' : ''}` : ''}
                    </p>
                </div>
                <Link href="/dashboard/audit">
                    <Button size="sm" icon={Plus}>{t('dashboard.runNewAudit')}</Button>
                </Link>
            </div>

            {websites.length === 0 ? (
                <Card hover={false} padding="p-12" className="text-center">
                    <Globe className="w-7 h-7 text-brand mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {t('dashboard.runNewAudit')}
                    </h3>
                    <p className="text-base text-text-secondary max-w-md mx-auto mb-6">
                        {t('audit.subtitle')}
                    </p>
                    <Link href="/dashboard/audit">
                        <Button icon={Plus}>{t('dashboard.runNewAudit')}</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {websites.map((site) => (
                        <Card key={site.domain} hover={false} padding="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Globe className="w-5 h-5 text-brand shrink-0" />
                                    <div>
                                        <h3 className="text-base font-semibold text-text-primary">{site.domain}</h3>
                                        <span className="text-xs text-text-muted">{site.lastScan}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {site.score > 0 && (
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-brand">{site.score}%</div>
                                            <div className="text-[10px] text-text-muted">{t('common.score')}</div>
                                        </div>
                                    )}
                                    {site.pages > 0 && (
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-text-primary">{site.pages}</div>
                                            <div className="text-[10px] text-text-muted">{t('common.pages')}</div>
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
