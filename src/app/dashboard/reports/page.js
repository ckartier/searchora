'use client';

import { FileText, Download, Calendar, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const reports = [
    { id: 1, title: 'Monthly Visibility Report — March 2025', date: 'Mar 8, 2025', type: 'Monthly', pages: 12 },
    { id: 2, title: 'Competitor Analysis Report', date: 'Mar 1, 2025', type: 'Analysis', pages: 8 },
    { id: 3, title: 'Monthly Visibility Report — February 2025', date: 'Feb 28, 2025', type: 'Monthly', pages: 14 },
    { id: 4, title: 'Content Recommendations Brief', date: 'Feb 15, 2025', type: 'Brief', pages: 5 },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
                <p className="text-sm text-text-secondary mt-0.5">Download and review your AI visibility reports</p>
            </div>

            <div className="space-y-3">
                {reports.map((report) => (
                    <Card key={report.id} padding="p-5" className="cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-brand" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">{report.title}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-text-muted flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {report.date}
                                        </span>
                                        <span className="text-xs text-text-muted">·</span>
                                        <span className="text-xs text-text-muted">{report.pages} pages</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-brand bg-brand-50 px-2 py-0.5 rounded-full">
                                    {report.type}
                                </span>
                                <Button variant="ghost" size="sm" icon={Eye}>View</Button>
                                <Button variant="ghost" size="sm" icon={Download}>Download</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
