'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, TrendingUp, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Section, SectionLabel, SectionTitle, SectionDescription } from '@/components/ui/Section';
import { useI18n } from '@/lib/i18n';

export default function CaseStudiesPage() {
    const { t } = useI18n();

    return (
        <Section>
            <div className="min-h-[60vh] flex items-center justify-center">
                <AnimatedSection>
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <BarChart3 className="w-8 h-8 text-brand" />
                        </div>

                        <SectionLabel className="mb-4">Case Studies</SectionLabel>
                        <SectionTitle className="mb-4">
                            Coming Soon
                        </SectionTitle>
                        <SectionDescription className="mx-auto mb-10">
                            We are currently working with our first clients to document real results.
                            Case studies with verified metrics will be published here.
                        </SectionDescription>

                        <div className="grid sm:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white border border-border rounded-xl p-5 text-center">
                                <TrendingUp className="w-5 h-5 text-brand mx-auto mb-3" />
                                <p className="text-sm font-medium text-text-primary mb-1">Visibility Growth</p>
                                <p className="text-xs text-text-secondary">Real before/after AI visibility scores</p>
                            </div>
                            <div className="bg-white border border-border rounded-xl p-5 text-center">
                                <FileText className="w-5 h-5 text-brand mx-auto mb-3" />
                                <p className="text-sm font-medium text-text-primary mb-1">Strategy Breakdown</p>
                                <p className="text-xs text-text-secondary">Detailed audit insights and actions taken</p>
                            </div>
                            <div className="bg-white border border-border rounded-xl p-5 text-center">
                                <BarChart3 className="w-5 h-5 text-brand mx-auto mb-3" />
                                <p className="text-sm font-medium text-text-primary mb-1">Measurable Impact</p>
                                <p className="text-xs text-text-secondary">Citation rates, traffic, and engagement metrics</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact">
                                <Button icon={ArrowRight} iconPosition="right">
                                    {t('nav.requestAudit')}
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="secondary">
                                    {t('auth.signup')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </Section>
    );
}
