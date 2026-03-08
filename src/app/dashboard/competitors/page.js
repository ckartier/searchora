'use client';

import { Target, Plus, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const competitors = [
    { name: 'CompetitorA', domain: 'competitor-a.com', score: 72, citations: 28, change: '+5%', trend: 'up' },
    { name: 'CompetitorB', domain: 'competitor-b.com', score: 64, citations: 19, change: '-3%', trend: 'down' },
    { name: 'CompetitorC', domain: 'competitor-c.com', score: 58, citations: 14, change: '+2%', trend: 'up' },
];

export default function CompetitorsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Competitors</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Track competitor AI visibility</p>
                </div>
                <Button size="sm" icon={Plus}>Add Competitor</Button>
            </div>

            {/* Your brand card */}
            <Card hover={false} padding="p-6" className="border-brand/20 bg-brand-50/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-text-primary">Your Brand</h3>
                            <span className="text-xs text-text-muted">acmecrm.com</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-brand">78%</div>
                            <div className="text-[10px] text-text-muted">Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-text-primary">34</div>
                            <div className="text-[10px] text-text-muted">Citations</div>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +12%
                        </span>
                    </div>
                </div>
            </Card>

            {/* Competitors */}
            <div className="space-y-3">
                {competitors.map((comp) => (
                    <Card key={comp.name} padding="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-surface-secondary rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-text-muted" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-text-primary">{comp.name}</h3>
                                        <ExternalLink className="w-3 h-3 text-text-muted" />
                                    </div>
                                    <span className="text-xs text-text-muted">{comp.domain}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-text-primary">{comp.score}%</div>
                                    <div className="text-[10px] text-text-muted">Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-text-primary">{comp.citations}</div>
                                    <div className="text-[10px] text-text-muted">Citations</div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${comp.trend === 'up' ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'
                                    }`}>
                                    {comp.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {comp.change}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
