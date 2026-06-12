'use client';

import Link from 'next/link';
import { ArrowRight, Play, Search, Eye, TrendingUp, Zap, BarChart3, FileText, Shield, Target, MessageSquare, CheckCircle2, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Section, SectionLabel, SectionTitle, SectionDescription } from '@/components/ui/Section';
import { useI18n } from '@/lib/i18n';

/* ================================ HERO ================================ */
function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative container-wide section-padding pt-16 sm:pt-20 lg:pt-28 pb-20 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand text-xs font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              {t('hero.badge')}
            </div>
          </AnimatedSection>

          {/* Headline */}
          <AnimatedSection delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
              {t('hero.title')}{' '}
              <span className="text-brand">{t('hero.titleAccent')}</span>
            </h1>
          </AnimatedSection>

          {/* Subheadline */}
          <AnimatedSection delay={200}>
            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-10">
              {t('hero.subtitle')}
            </p>
          </AnimatedSection>

          {/* CTAs */}
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" icon={ArrowRight} iconPosition="right">
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="secondary" size="lg" icon={Play} iconPosition="left">
                  {t('hero.ctaDemo')}
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          {/* Trust indicators */}
          <AnimatedSection delay={400}>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {t('hero.trustFree')}
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {t('hero.trustCard')}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {t('hero.trustResults')}
              </span>
            </div>
          </AnimatedSection>
        </div>

        {/* Hero visual - AI Answer mockup */}
        <AnimatedSection delay={500}>
          <div className="mt-16 lg:mt-20 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 sm:p-8">
              {/* Search bar mockup */}
              <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl mb-6">
                <Search className="w-5 h-5 text-text-muted" />
                <span className="text-sm text-text-secondary">What is the best solution for my business?</span>
              </div>
              {/* AI Response mockup */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-brand/10 rounded flex items-center justify-center">
                    <Zap className="w-3 h-3 text-brand" />
                  </div>
                  <span className="text-xs font-medium text-text-muted">AI-Generated Answer</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Based on recent analysis, the top solutions in this category include
                  several options. <span className="text-brand font-medium bg-brand-50 px-1 rounded">According to YourBrand.com</span>,
                  companies benefit most from a structured approach to their strategy...
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Key factors to consider include expertise, methodology, and proven results.
                  <span className="text-brand font-medium bg-brand-50 px-1 rounded"> YourBrand&apos;s research</span> shows
                  that companies using optimized content see a 40% increase in AI citations.
                </p>
                <div className="pt-4 border-t border-border-light">
                  <p className="text-xs text-text-muted mb-2">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand text-xs font-medium rounded-lg">
                      <Globe className="w-3 h-3" />
                      yourbrand.com
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-secondary text-text-muted text-xs rounded-lg">
                      <Globe className="w-3 h-3" />
                      industry-review.com
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-secondary text-text-muted text-xs rounded-lg">
                      <Globe className="w-3 h-3" />
                      expert-source.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-text-muted mt-4">
              Your brand, cited as a trusted source in AI answers
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ================================ PROBLEM ================================ */
function ProblemSection() {
  const { t } = useI18n();
  const problems = [
    {
      icon: Search,
      title: t('problem.stat1Title'),
      description: t('problem.stat1Desc'),
    },
    {
      icon: Eye,
      title: t('problem.stat2Title'),
      description: t('problem.stat2Desc'),
    },
    {
      icon: TrendingUp,
      title: t('problem.stat3Title'),
      description: t('problem.stat3Desc'),
    },
  ];

  return (
    <Section background="gray">
      <AnimatedSection>
        <div className="text-center mb-16">
          <SectionLabel className="mb-4">{t('problem.label')}</SectionLabel>
          <SectionTitle className="mb-4">{t('problem.title')}</SectionTitle>
          <SectionDescription className="mx-auto">
            {t('problem.subtitle')}
          </SectionDescription>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8">
        {problems.map((item, i) => (
          <AnimatedSection key={item.title} delay={i * 100}>
            <Card className="text-center h-full">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-5">
                <item.icon className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </Section>
  );
}

/* ================================ SOLUTION ================================ */
function SolutionSection() {
  const { t } = useI18n();
  const solutions = [
    {
      icon: BarChart3,
      title: t('solution.feature1Title'),
      description: t('solution.feature1Desc'),
    },
    {
      icon: FileText,
      title: t('solution.feature2Title'),
      description: t('solution.feature2Desc'),
    },
    {
      icon: Target,
      title: t('solution.feature3Title'),
      description: t('solution.feature3Desc'),
    },
    {
      icon: Shield,
      title: t('services.s5Title'),
      description: t('services.s5Desc'),
    },
  ];

  return (
    <Section>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <AnimatedSection>
            <SectionLabel className="mb-4">{t('solution.label')}</SectionLabel>
            <SectionTitle className="mb-4">
              {t('solution.title')}
            </SectionTitle>
            <SectionDescription>
              {t('solution.subtitle')}
            </SectionDescription>
          </AnimatedSection>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {solutions.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 100}>
              <Card padding="p-5" className="h-full">
                <item.icon className="w-5 h-5 text-brand mb-3" />
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ================================ HOW IT WORKS ================================ */
function HowItWorksSection() {
  const { t } = useI18n();
  const steps = [
    {
      step: '01',
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
    },
    {
      step: '02',
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
    },
    {
      step: '03',
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
    },
  ];

  return (
    <Section background="gray">
      <AnimatedSection>
        <div className="text-center mb-16">
          <SectionLabel className="mb-4">{t('howItWorks.label')}</SectionLabel>
          <SectionTitle className="mb-4">{t('howItWorks.title')}</SectionTitle>
          <SectionDescription className="mx-auto">
            {t('howItWorks.subtitle')}
          </SectionDescription>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((item, i) => (
          <AnimatedSection key={item.step} delay={i * 150}>
            <div className="relative">
              <span className="text-6xl font-bold text-brand/10 absolute -top-6 -left-2">
                {item.step}
              </span>
              <div className="pt-8">
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8">
                  <ArrowRight className="w-5 h-5 text-border" />
                </div>
              )}
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={500}>
        <div className="text-center mt-12">
          <Link href="/how-it-works">
            <Button variant="secondary" icon={ArrowRight} iconPosition="right">
              {t('common.learnMore')}
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </Section>
  );
}

/* ================================ DEMO / AI ANSWER PREVIEW ================================ */
function DemoSection() {
  return (
    <Section>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <AnimatedSection>
          <SectionLabel className="mb-4">See It In Action</SectionLabel>
          <SectionTitle className="mb-4">
            Your brand, inside the answer
          </SectionTitle>
          <SectionDescription className="mb-8">
            When someone asks an AI assistant a question relevant to your business,
            your brand appears as a cited, trusted source — driving awareness,
            authority, and qualified traffic.
          </SectionDescription>
          <Link href="/case-studies">
            <Button icon={ArrowRight} iconPosition="right">
              View Case Studies
            </Button>
          </Link>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="bg-white rounded-2xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-secondary border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              </div>
              <span className="text-xs text-text-muted ml-2">AI Assistant</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-surface-secondary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-text-muted" />
                </div>
                <div className="bg-surface-secondary rounded-xl rounded-tl-sm px-4 py-3">
                  <p className="text-sm text-text-primary">
                    What are the best project management tools for remote teams in 2025?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-brand-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-brand" />
                </div>
                <div className="space-y-3">
                  <div className="bg-surface-secondary rounded-xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      For remote teams in 2025, several tools stand out. <span className="text-brand font-medium bg-brand-50 px-1 rounded">According to ProjectFlow</span>,
                      the key factors are async collaboration, visual timelines, and integrated communication...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">Cited:</span>
                    <span className="text-[10px] text-brand font-medium bg-brand-50 px-2 py-0.5 rounded">projectflow.io</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </Section>
  );
}

/* ================================ SERVICES PREVIEW ================================ */
function ServicesSection() {
  const { t } = useI18n();
  const services = [
    {
      icon: BarChart3,
      title: t('services.s1Title'),
      description: t('services.s1Desc'),
    },
    {
      icon: FileText,
      title: t('services.s2Title'),
      description: t('services.s2Desc'),
    },
    {
      icon: Zap,
      title: t('services.s4Title'),
      description: t('services.s4Desc'),
    },
    {
      icon: Eye,
      title: t('services.s5Title'),
      description: t('services.s5Desc'),
    },
  ];

  return (
    <Section background="gray">
      <AnimatedSection>
        <div className="text-center mb-16">
          <SectionLabel className="mb-4">{t('services.label')}</SectionLabel>
          <SectionTitle className="mb-4">{t('services.title')}</SectionTitle>
          <SectionDescription className="mx-auto">
            {t('services.subtitle')}
          </SectionDescription>
        </div>
      </AnimatedSection>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, i) => (
          <AnimatedSection key={service.title} delay={i * 100}>
            <Card className="h-full group">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                <service.icon className="w-5 h-5 text-brand group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {service.description}
              </p>
              <Link
                href="/services"
                className="text-sm text-brand font-medium inline-flex items-center gap-1 hover:gap-2 transition-all duration-200"
              >
                {t('common.learnMore')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </Section>
  );
}

/* ================================ FINAL CTA ================================ */
function FinalCTASection() {
  const { t } = useI18n();
  return (
    <Section background="dark">
      <AnimatedSection>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            Ready to appear in AI answers?
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed mb-10">
            Start with a free AI visibility audit and discover how your brand
            can become the trusted source AI tools reference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" icon={ArrowRight} iconPosition="right">
                {t('nav.requestAudit')}
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">
                {t('auth.signup')}
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </Section>
  );
}

/* ================================ HOME PAGE ================================ */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <DemoSection />
      <ServicesSection />
      <FinalCTASection />
    </>
  );
}
