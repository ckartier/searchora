'use client';

import { BarChart3, Plus, Calendar, TrendingUp, Eye, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const audits = [
    { id: 1, date: 'Today, 2:30 PM', website: 'acmecrm.com', score: 78, promptsAnalyzed: 50, status: 'completed' },
    { id: 2, date: 'Mar 5, 2025', website: 'acmecrm.com', score: 71, promptsAnalyzed: 50, status: 'completed' },
    { id: 3, date: 'Feb 28, 2025', website: 'blog.acmecrm.com', score: 62, promptsAnalyzed: 50, status: 'completed' },
    { id: 4, date: 'Feb 15, 2025', website: 'acmecrm.com', score: 55, promptsAnalyzed: 50, status: 'completed' },
    { id: 5, date: 'Feb 1, 2025', website: 'acmecrm.com', score: 48, promptsAnalyzed: 45, status: 'completed' },
];

export default function AuditsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Audits</h1>
                    <p className="text-sm text-text-secondary mt-0.5">View all past AI visibility audits</p>
                </div>
                <Link href="/dashboard/audit">
                    <Button size="sm" icon={Plus}>New Audit</Button>
                </Link>
            </div>

            <div className="space-y-3">
                {audits.map((audit) => (
                    <Card key={audit.id} padding="p-5" className="cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-brand" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">{audit.website}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-text-muted flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {audit.date}
                                        </span>
                                        <span className="text-xs text-text-muted">·</span>
                                        <span className="text-xs text-text-muted">{audit.promptsAnalyzed} prompts</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-xl font-bold text-brand">{audit.score}%</div>
                                    <div className="text-[10px] text-text-muted">Visibility</div>
                                </div>
                                <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                    {audit.status}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
