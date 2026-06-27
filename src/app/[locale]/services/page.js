'use client';

import Link from '@/components/ui/LocaleLink';
import { ArrowRight, BarChart3, FileText, Zap, Eye, Target, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Section, SectionLabel } from '@/components/ui/Section';
import { useI18n } from '@/lib/i18n';

export default function ServicesPage() {
    const { t } = useI18n();

    const services = [
        {
            icon: BarChart3,
            title: t('services.s1Title'),
            description: t('services.s1Desc'),
            benefits: [
                'Complete visibility scorecard across all major AI platforms',
                'Detailed competitor comparison and gap analysis',
                'Identification of high-impact optimization opportunities',
                'Actionable priority list with expected impact scores',
                'Custom report delivered within 5 business days',
            ],
            highlight: true,
        },
        {
            icon: FileText,
            title: t('services.s2Title'),
            description: t('services.s2Desc'),
            benefits: [
                'AI-optimized content audit and strategy',
                'FAQ and structured answer content creation',
                'Entity-rich content frameworks',
                'Topical authority cluster development',
                'Content calendar with AI-visibility focus',
            ],
        },
        {
            icon: Zap,
            title: t('services.s4Title'),
            description: t('services.s4Desc'),
            benefits: [
                'Advanced schema markup implementation',
                'Knowledge graph optimization',
                'Site architecture for AI crawlability',
                'Entity signal strengthening',
                'Structured data validation and testing',
            ],
        },
        {
            icon: Target,
            title: t('services.s3Title'),
            description: t('services.s3Desc'),
            benefits: [
                'Competitor AI mention tracking',
                'Citation source comparison analysis',
                'Opportunity gap identification',
                'Strategic positioning recommendations',
                'Monthly competitive intelligence reports',
            ],
        },
        {
            icon: Eye,
            title: t('services.s5Title'),
            description: t('services.s5Desc'),
            benefits: [
                'Real-time AI answer monitoring dashboard',
                'Automated alerts for new citations or drops',
                'Weekly and monthly performance reports',
                'Trend analysis and strategic adjustments',
                'Dedicated account manager support',
            ],
        },
    ];

    return (
        <>
            <section className="bg-white pt-12 pb-20 lg:pb-28 section-padding">
                <div className="container-wide">
                    <AnimatedSection>
                        <div className="max-w-3xl">
                            <SectionLabel className="mb-4">{t('services.label')}</SectionLabel>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
                                {t('services.title')}
                            </h1>
                            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mb-8">
                                {t('services.subtitle')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/contact">
                                    <Button size="lg" icon={ArrowRight} iconPosition="right">
                                        {t('common.getStarted')}
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button variant="secondary" size="lg">
                                        {t('nav.pricing')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <Section background="gray">
                <div className="space-y-8">
                    {services.map((service) => (
                        <AnimatedSection key={service.title} delay={100}>
                            <Card hover={false} padding="p-0" className={`overflow-hidden ${service.highlight ? 'border-brand/20 ring-1 ring-brand/10' : ''}`}>
                                <div className="grid lg:grid-cols-5 gap-0">
                                    <div className="lg:col-span-3 p-8 lg:p-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.highlight ? 'bg-brand text-white' : 'bg-brand-50'}`}>
                                                <service.icon className={`w-5 h-5 ${service.highlight ? 'text-white' : 'text-brand'}`} />
                                            </div>
                                            {service.highlight && (
                                                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand bg-brand-50 px-2 py-0.5 rounded-full">
                                                    {t('pricing.mostPopular')}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-text-primary mb-3">{service.title}</h2>
                                        <p className="text-base text-text-secondary leading-relaxed mb-6">{service.description}</p>
                                        <Link href="/contact">
                                            <Button variant={service.highlight ? 'primary' : 'secondary'} icon={ArrowRight} iconPosition="right">
                                                {t('nav.contact')}
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="lg:col-span-2 bg-surface-secondary p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-border">
                                        <ul className="space-y-3">
                                            {service.benefits.map((benefit) => (
                                                <li key={benefit} className="flex items-start gap-2.5">
                                                    <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                                                    <span className="text-sm text-text-secondary">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </AnimatedSection>
                    ))}
                </div>
            </Section>

            <Section background="dark">
                <AnimatedSection>
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                            {t('contact.title')}
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">
                            {t('contact.subtitle')}
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
