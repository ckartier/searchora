'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Play, Search, BarChart3, FileText, Target, Eye,
  Send, ScanLine, ClipboardList, LineChart,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Section, SectionLabel, SectionTitle, SectionDescription } from '@/components/ui/Section';
import { useI18n } from '@/lib/i18n';

/* ---- shared: respects prefers-reduced-motion ---- */
function prefersReduced() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---- check / cross marks (SVG, never glyphs) ---- */
function CheckMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CrossMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ================================ HERO ================================ */
function HeroSection() {
  const { t } = useI18n();

  // Live AI answer: type the answer, reveal sources, climb the score to 87.
  const pre = t('home.demoAnswerPre');
  const mark = t('home.demoAnswerMark');
  const post = t('home.demoAnswerPost');
  const full = pre + mark + post;

  const [typed, setTyped] = useState(0);
  const [showSources, setShowSources] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (prefersReduced()) {
      setTyped(full.length);
      setShowSources(true);
      setScore(87);
      return;
    }
    let i = 0;
    const start = setTimeout(() => {
      const typer = setInterval(() => {
        i += 1;
        setTyped(i);
        if (i >= full.length) {
          clearInterval(typer);
          setShowSources(true);
          const target = 87;
          const t0 = performance.now();
          const dur = 1100;
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setScore(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }, 26);
    }, 1300);
    return () => clearTimeout(start);
  }, [full.length]);

  // Render typed text with the brand sentence highlighted via .mk
  const renderTyped = () => {
    const shown = full.slice(0, typed);
    const markStart = pre.length;
    const markEnd = pre.length + mark.length;
    const a = shown.slice(0, Math.min(typed, markStart));
    const b = shown.slice(markStart, Math.min(typed, markEnd));
    const c = shown.slice(markEnd);
    return (
      <>
        {a}
        {b && (
          <span className="relative inline bg-mark/70 box-decoration-clone px-0.5 rounded-[2px]">{b}</span>
        )}
        {c}
      </>
    );
  };

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="container-wide section-padding pt-14 sm:pt-20 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Left: cascade copy */}
          <div className="cascade max-w-xl">
            <span className="eyebrow">{t('hero.badge')}</span>
            <h1 className="text-text-primary mt-5">
              {t('hero.title')}{' '}
              <span className="mk">{t('hero.titleAccent')}</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mt-6">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-8">
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8">
              {[t('hero.trustFree'), t('hero.trustCard'), t('hero.trustResults')].map((label) => (
                <span key={label} className="inline-flex items-center gap-2 text-sm text-text-secondary">
                  <CheckMark className="w-4 h-4 text-ok" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: live AI answer panel */}
          <div className="panel-in">
            <div className="bg-white rounded-[14px] border border-line shadow-[0_30px_60px_-30px_rgba(21,104,223,0.35)] overflow-hidden">
              {/* search row */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
                <Search className="w-4 h-4 text-ink-soft shrink-0" strokeWidth={1.6} />
                <span className="text-sm text-text-secondary">{t('home.demoQuestion')}</span>
              </div>
              {/* answer */}
              <div className="p-5 sm:p-6">
                <div className="eyebrow mb-4">{t('hero.badge')}</div>
                <p className="text-[15px] text-text-primary leading-relaxed min-h-[5.5rem]">
                  {renderTyped()}
                  {typed < full.length && <span className="typing-cursor" />}
                </p>

                {/* sources */}
                <div
                  className="mt-5 pt-4 border-t border-line transition-all duration-500 [transition-timing-function:var(--ease)]"
                  style={{ opacity: showSources ? 1 : 0, transform: showSources ? 'translateY(0)' : 'translateY(8px)' }}
                >
                  <p className="[font-family:var(--font-mono)] text-[11px] uppercase tracking-[.12em] text-ink-soft mb-2.5">
                    {t('home.demoSources')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip chip-active">yourbrand.com</span>
                    <span className="chip">industry-review.com</span>
                    <span className="chip">expert-source.com</span>
                  </div>
                </div>

                {/* score */}
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="[font-family:var(--font-mono)] text-[11px] uppercase tracking-[.12em] text-ink-soft">
                        {t('home.demoScore')}
                      </span>
                      <span className="[font-family:var(--font-display)] text-lg font-bold text-blue tabular-nums">
                        {score}<span className="text-ink-soft text-sm font-normal">/100</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-paper-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue transition-[width] duration-200 ease-linear"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================ STATS BANNER ================================ */
function StatCounter({ value, suffix = '%' }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) { setN(value); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const dur = 1200;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * value));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="[font-family:var(--font-display)] font-bold text-blue tabular-nums" style={{ fontSize: 'clamp(40px,5vw,60px)', lineHeight: 1 }}>
      {n}{suffix}
    </span>
  );
}

function StatsBanner() {
  const { t } = useI18n();
  const stats = [
    { value: 58, label: t('home.stat1Label') },
    { value: 34, label: t('home.stat2Label') },
    { value: 91, label: t('home.stat3Label') },
  ];
  return (
    <Section background="gray">
      <AnimatedSection>
        <span className="eyebrow mb-10 block">{t('home.statsEyebrow')}</span>
      </AnimatedSection>
      <AnimatedSection stagger className="grid sm:grid-cols-3 gap-8 lg:gap-12">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-line pt-6">
            <StatCounter value={s.value} />
            <p className="text-text-secondary leading-relaxed mt-3 max-w-[16rem]">{s.label}</p>
          </div>
        ))}
      </AnimatedSection>
    </Section>
  );
}

/* ================================ BEFORE / AFTER ================================ */
function BeforeAfter() {
  const { t } = useI18n();
  const before = [t('home.before1'), t('home.before2'), t('home.before3')];
  const after = [t('home.after1'), t('home.after2'), t('home.after3')];

  return (
    <Section>
      <AnimatedSection>
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <SectionLabel className="mb-4 justify-center">{t('home.baEyebrow')}</SectionLabel>
          <SectionTitle className="mb-4">{t('home.baTitle')}</SectionTitle>
          <SectionDescription className="mx-auto">{t('home.baSubtitle')}</SectionDescription>
        </div>
      </AnimatedSection>

      <AnimatedSection stagger className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card hover={false} className="bg-paper-2 border-line">
          <p className="[font-family:var(--font-mono)] text-[12px] uppercase tracking-[.12em] text-ink-soft mb-5">
            {t('home.beforeLabel')}
          </p>
          <ul className="space-y-4">
            {before.map((item) => (
              <li key={item} className="flex items-start gap-3 text-text-secondary">
                <CrossMark className="w-5 h-5 mt-0.5 shrink-0 text-[#B33]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card hover={false} className="border-blue/40 shadow-[0_20px_40px_-26px_rgba(21,104,223,0.4)]">
          <p className="[font-family:var(--font-mono)] text-[12px] uppercase tracking-[.12em] text-blue mb-5">
            {t('home.afterLabel')}
          </p>
          <ul className="space-y-4">
            {after.map((item) => (
              <li key={item} className="flex items-start gap-3 text-text-primary">
                <CheckMark className="w-5 h-5 mt-0.5 shrink-0 text-ok" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </AnimatedSection>
    </Section>
  );
}

/* ================================ PIPELINE ================================ */
function Pipeline() {
  const { t } = useI18n();
  const steps = [
    { icon: Send, title: t('home.pStep1Title'), desc: t('home.pStep1Desc') },
    { icon: ScanLine, title: t('home.pStep2Title'), desc: t('home.pStep2Desc') },
    { icon: ClipboardList, title: t('home.pStep3Title'), desc: t('home.pStep3Desc') },
    { icon: LineChart, title: t('home.pStep4Title'), desc: t('home.pStep4Desc') },
  ];
  return (
    <Section background="gray">
      <AnimatedSection>
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <SectionLabel className="mb-4 justify-center">{t('home.pipelineEyebrow')}</SectionLabel>
          <SectionTitle className="mb-4">{t('home.pipelineTitle')}</SectionTitle>
          <SectionDescription className="mx-auto">{t('home.pipelineSubtitle')}</SectionDescription>
        </div>
      </AnimatedSection>

      <AnimatedSection stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <Card key={s.title} className="h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="icon-tile">
                <s.icon className="w-[22px] h-[22px]" strokeWidth={1.6} />
              </div>
              <span className="[font-family:var(--font-mono)] text-[12px] tracking-[.12em] text-ink-soft">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">{s.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
          </Card>
        ))}
      </AnimatedSection>
    </Section>
  );
}

/* ================================ SERVICES ================================ */
function ServicesSection() {
  const { t } = useI18n();
  const services = [
    { icon: BarChart3, title: t('services.s1Title'), description: t('services.s1Desc') },
    { icon: FileText, title: t('services.s2Title'), description: t('services.s2Desc') },
    { icon: Target, title: t('services.s3Title'), description: t('services.s3Desc') },
    { icon: Eye, title: t('services.s5Title'), description: t('services.s5Desc') },
  ];
  return (
    <Section>
      <AnimatedSection>
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <SectionLabel className="mb-4 justify-center">{t('services.label')}</SectionLabel>
          <SectionTitle className="mb-4">{t('services.title')}</SectionTitle>
          <SectionDescription className="mx-auto">{t('services.subtitle')}</SectionDescription>
        </div>
      </AnimatedSection>

      <AnimatedSection stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <Card key={service.title} className="h-full flex flex-col">
            <div className="icon-tile mb-5">
              <service.icon className="w-[22px] h-[22px]" strokeWidth={1.6} />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-2">{service.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">{service.description}</p>
            <Link
              href="/services"
              className="mt-auto text-sm text-blue font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              {t('common.learnMore')} <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            </Link>
          </Card>
        ))}
      </AnimatedSection>
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
          <h2 className="text-white mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-lg text-white/70 leading-relaxed mb-9">{t('home.ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contact">
              <Button size="lg" icon={ArrowRight} iconPosition="right">
                {t('nav.requestAudit')}
              </Button>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-full border border-white/35 text-white hover:bg-white hover:text-ink hover:-translate-y-0.5 transition-all [transition-timing-function:var(--ease)]"
            >
              {t('auth.signup')}
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
      <StatsBanner />
      <BeforeAfter />
      <Pipeline />
      <ServicesSection />
      <FinalCTASection />
    </>
  );
}
