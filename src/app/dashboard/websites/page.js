'use client';

import { Globe, Plus, ExternalLink, TrendingUp, BarChart3, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const websites = [
    {
        domain: 'acmecrm.com',
        status: 'active',
        lastScan: '2 hours ago',
        score: 78,
        pages: 142,
        citations: 34,
    },
    {
        domain: 'blog.acmecrm.com',
        status: 'active',
        lastScan: '3 days ago',
        score: 62,
        pages: 87,
        citations: 12,
    },
];

export default function WebsitesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Websites</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Manage your tracked websites</p>
                </div>
                <Button size="sm" icon={Plus}>Add Website</Button>
            </div>

            <div className="grid gap-4">
                {websites.map((site) => (
                    <Card key={site.domain} hover={false} padding="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-brand" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-text-primary">{site.domain}</h3>
                                        <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            Active
                                        </span>
                                        <span className="text-xs text-text-muted flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {site.lastScan}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-brand">{site.score}%</div>
                                    <div className="text-[10px] text-text-muted">Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-text-primary">{site.pages}</div>
                                    <div className="text-[10px] text-text-muted">Pages</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-text-primary">{site.citations}</div>
                                    <div className="text-[10px] text-text-muted">Citations</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty state hint */}
            <Card hover={false} padding="p-8" className="border-dashed text-center">
                <Globe className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-3">Want to track another website?</p>
                <Button variant="secondary" size="sm" icon={Plus}>Add Website</Button>
            </Card>
        </div>
    );
}
