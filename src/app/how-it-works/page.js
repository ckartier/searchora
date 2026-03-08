'use client';

import Link from 'next/link';
import { ArrowRight, Search, BarChart3, FileText, Target, Eye, CheckCircle2, Zap, TrendingUp, Database } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Section, SectionLabel, SectionTitle, SectionDescription } from '@/components/ui/Section';
import { useI18n } from '@/lib/i18n';

export default function HowItWorksPage() {
    const { t } = useI18n();

    const steps = [
        {
            step: '01',
            icon: Search,
            title: t('howItWorks.step1Title'),
            subtitle: t('solution.feature1Title'),
            description: t('howItWorks.step1Desc'),
            details: [
                'Query your brand across 100+ relevant AI prompts',
                'Map citations, mentions, and source references',
                'Compare visibility against top competitors',
                'Identify gaps in AI-retrievable content',
                'Generate a comprehensive visibility scorecard',
            ],
        },
        {
            step: '02',
            icon: Database,
            title: t('howItWorks.step2Title'),
            subtitle: t('solution.feature2Title'),
            description: t('howItWorks.step2Desc'),
            details: [
                'Analyze brand entity recognition in LLMs',
                'Audit structured data and schema markup',
                'Review content readability for AI retrieval',
                'Map topical authority and content clusters',
                'Identify missing knowledge graph connections',
            ],
        },
        {
            step: '03',
            icon: FileText,
            title: t('howItWorks.step3Title'),
            subtitle: t('solution.feature3Title'),
            description: t('howItWorks.step3Desc'),
            details: [
                'Content creation roadmap for AI retrieval',
                'Technical SEO optimization checklist',
                'Entity signal strengthening strategy',
                'FAQ and structured answer templates',
                'Authority building action items',
            ],
        },
        {
            step: '04',
            icon: Eye,
            title: t('howItWorks.step4Title'),
            subtitle: t('services.s5Title'),
            description: t('howItWorks.step4Desc'),
            details: [
                'Daily AI answer monitoring across platforms',
                'Weekly visibility score tracking',
                'Competitor movement alerts',
                'Monthly optimization reports',
                'Quarterly strategy review sessions',
            ],
        },
    ];

    return (
        <>
            <section className="bg-white pt-12 pb-20 lg:pb-28 section-padding">
                <div className="container-wide">
                    <AnimatedSection>
                        <div className="max-w-3xl">
                            <SectionLabel className="mb-4">{t('howItWorks.label')}</SectionLabel>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
                                {t('howItWorks.title')}
                            </h1>
                            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mb-8">
                                {t('howItWorks.subtitle')}
                            </p>
                            <Link href="/contact">
                                <Button size="lg" icon={ArrowRight} iconPosition="right">
                                    {t('nav.requestAudit')}
                                </Button>
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <Section background="gray">
                <div className="space-y-20">
                    {steps.map((step, i) => (
                        <AnimatedSection key={step.step} delay={100}>
                            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-start ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                                <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-5xl font-bold text-brand/15">{step.step}</span>
                                        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                                            <step.icon className="w-6 h-6 text-brand" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">{step.subtitle}</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">{step.title}</h2>
                                    <p className="text-base text-text-secondary leading-relaxed mb-6">{step.description}</p>
                                </div>
                                <div className={i % 2 !== 0 ? 'lg:order-1' : ''}>
                                    <Card hover={false} padding="p-8">
                                        <ul className="space-y-3">
                                            {step.details.map((detail) => (
                                                <li key={detail} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                                                    <span className="text-sm text-text-secondary">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </Section>

            <Section background="dark">
                <AnimatedSection>
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                            {t('pricing.startFree')}
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">
                            {t('pricing.subtitle')}
                        </p>
                        <Link href="/contact">
                            <Button size="lg" icon={ArrowRight} iconPosition="right">
                                {t('nav.requestAudit')}
                            </Button>
                        </Link>
                    </div>
                </AnimatedSection>
            </Section>
        </>
    );
}
