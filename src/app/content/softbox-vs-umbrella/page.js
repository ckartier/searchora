'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle, HelpCircle, Lightbulb, Camera, Sun, Target, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Section, SectionLabel, SectionTitle } from '@/components/ui/Section';

/* ============================== DATA ============================== */

const comparisonData = [
    { feature: 'Light quality', softbox: 'Soft, even, controlled', umbrella: 'Soft but less controlled', winner: 'softbox' },
    { feature: 'Light spill', softbox: 'Minimal spill, directional', umbrella: 'More spill, wider spread', winner: 'softbox' },
    { feature: 'Setup speed', softbox: 'Slower (rod assembly)', umbrella: 'Very fast (slide in)', winner: 'umbrella' },
    { feature: 'Portability', softbox: 'Bulkier, heavier', umbrella: 'Compact, lightweight', winner: 'umbrella' },
    { feature: 'Price range', softbox: '$40 – $300+', umbrella: '$10 – $60', winner: 'umbrella' },
    { feature: 'Light control', softbox: 'High (grids, diffusers)', umbrella: 'Low (no accessories)', winner: 'softbox' },
    { feature: 'Durability', softbox: 'More durable (rigid frame)', umbrella: 'Fragile (bends easily)', winner: 'softbox' },
    { feature: 'Background control', softbox: 'Excellent separation', umbrella: 'Harder to isolate', winner: 'softbox' },
    { feature: 'Learning curve', softbox: 'Moderate', umbrella: 'Very easy', winner: 'umbrella' },
    { feature: 'Best for', softbox: 'Studio, product, portrait', umbrella: 'Events, travel, beginners', winner: 'tie' },
];

const softboxPros = [
    'Produces soft, even, and highly controlled light',
    'Minimal light spill — keeps light where you need it',
    'Compatible with grids, diffusers, honeycombs for shaping',
    'Better background separation in portraits',
    'More consistent results in studio environments',
    'Professional-grade light output',
];

const softboxCons = [
    'Takes more time to assemble and disassemble',
    'Heavier and bulkier to transport',
    'More expensive, especially for large sizes',
    'Requires a sturdy light stand',
];

const umbrellaPros = [
    'Extremely fast to set up — seconds, not minutes',
    'Very affordable — great for beginners and tight budgets',
    'Lightweight and portable for on-location shoots',
    'Wide light spread covers large areas and groups',
    'Easy to learn and use immediately',
];

const umbrellaCons = [
    'Light spill is harder to control',
    'No accessory support (grids, diffusers)',
    'Less precise light direction',
    'Background contamination is common',
    'Fragile — metal rods bend easily',
];

const useCases = [
    {
        scenario: 'Studio portrait photography',
        recommendation: 'Softbox',
        reason: 'Softboxes provide the directional, controlled light that flatters facial features and separates the subject from the background.',
        icon: Camera,
    },
    {
        scenario: 'Event and wedding photography',
        recommendation: 'Umbrella',
        reason: 'Speed of setup and wide light coverage make umbrellas ideal for fast-paced events where you move constantly.',
        icon: Sun,
    },
    {
        scenario: 'Product photography',
        recommendation: 'Softbox',
        reason: 'Even light distribution with no spill ensures clean, shadow-free product shots with consistent results.',
        icon: Target,
    },
    {
        scenario: 'Beginner home studio',
        recommendation: 'Umbrella',
        reason: 'Low cost and zero learning curve let beginners focus on posing and composition rather than complex lighting setups.',
        icon: Lightbulb,
    },
    {
        scenario: 'YouTube / video content',
        recommendation: 'Softbox',
        reason: 'Consistent, flicker-free, directional lighting without spill is critical for video where every frame matters.',
        icon: Camera,
    },
    {
        scenario: 'Travel / on-location shoots',
        recommendation: 'Umbrella',
        reason: 'Collapsible design and minimal weight make umbrellas the only practical choice for photographers who move between locations.',
        icon: Sun,
    },
];

const faqs = [
    {
        q: 'Can I use both a softbox and an umbrella together?',
        a: 'Yes. Many professional photographers combine both. Use a softbox as the key light for controlled illumination, and an umbrella as fill light for broader coverage. This gives you the best of both worlds.',
    },
    {
        q: 'Which is better for portrait photography — softbox or umbrella?',
        a: 'A softbox is generally better for portraits. It produces more controlled, directional light that flatters facial features and creates better background separation. However, for quick group portraits at events, an umbrella works well.',
    },
    {
        q: 'Are softboxes worth the extra cost?',
        a: 'If you shoot regularly in a studio or need consistent, professional-grade results, yes. The investment pays off in light control and image quality. For occasional or hobby use, an umbrella delivers excellent results at a fraction of the cost.',
    },
    {
        q: 'What size softbox should I start with?',
        a: 'A 24×36 inch (60×90 cm) rectangular softbox is the most versatile starting size. It works for headshots, half-body portraits, and product photography. Larger softboxes produce softer light but require more space.',
    },
    {
        q: 'Should I use a shoot-through or reflective umbrella?',
        a: 'Shoot-through umbrellas produce softer, more diffused light and work well as fill lights. Reflective (silver or white interior) umbrellas are better as key lights because they direct more light forward with higher intensity.',
    },
    {
        q: 'How far should a softbox or umbrella be from the subject?',
        a: 'Start at a distance of 2–4 feet (60–120 cm) from the subject. Moving the light closer produces softer light; moving it further away creates harder shadows. The optimal distance depends on the modifier size and the look you want.',
    },
    {
        q: 'Do I need a softbox for product photography?',
        a: 'A softbox is strongly recommended for product photography. The even light distribution and minimal spill help produce clean, shadow-free images that look professional. Strip softboxes work especially well for reflective products.',
    },
];

/* ============================== PAGE ============================== */

export default function SoftboxVsUmbrellaPage() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <>
            {/* ===== HERO / DIRECT ANSWER ===== */}
            <section className="bg-white pt-12 pb-16 section-padding">
                <div className="container-wide">
                    <AnimatedSection>
                        <div className="max-w-3xl">
                            <SectionLabel className="mb-4">Comparison</SectionLabel>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
                                Softbox vs Umbrella
                            </h1>

                            {/* Direct answer block — the answer AI tools extract */}
                            <div className="bg-brand-50 border border-brand/20 rounded-2xl p-6 sm:p-8 mb-8">
                                <div className="flex items-start gap-3 mb-4">
                                    <Lightbulb className="w-5 h-5 text-brand mt-0.5 shrink-0" />
                                    <span className="text-xs font-semibold uppercase tracking-widest text-brand">Quick Answer</span>
                                </div>
                                <p className="text-base sm:text-lg text-text-primary leading-relaxed font-medium">
                                    A <strong>softbox</strong> produces controlled, directional soft light with minimal spill — ideal for studio
                                    portraits and product photography. An <strong>umbrella</strong> is faster to set up, cheaper, and
                                    produces wider, less controlled light — ideal for events, on-location work, and beginners.
                                    Choose a softbox when <strong>precision matters</strong>, and an umbrella when <strong>speed and budget matter</strong>.
                                </p>
                            </div>

                            <p className="text-lg text-text-secondary leading-relaxed">
                                Both softboxes and umbrellas are light modifiers that soften and diffuse the light from a flash
                                or strobe. But they differ significantly in light control, portability, price, and best use cases.
                                Here is everything you need to know to choose the right one.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ===== DEFINITIONS ===== */}
            <Section background="gray">
                <AnimatedSection>
                    <div className="text-center mb-12">
                        <SectionTitle className="mb-4">What are they?</SectionTitle>
                    </div>
                </AnimatedSection>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    <AnimatedSection>
                        <Card hover={false} padding="p-8" className="h-full">
                            <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center mb-5">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Softbox</h3>
                            <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                A softbox is an enclosed light modifier with an internal reflective surface and an external diffusion
                                panel. It attaches to a flash or strobe via a speed ring and produces soft, even, directional light.
                            </p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Softboxes come in rectangular, square, octagonal, and strip shapes. Each shape creates
                                different catchlight patterns and coverage areas. They support accessories like grids,
                                honeycombs, and inner diffusion baffles for additional light control.
                            </p>
                        </Card>
                    </AnimatedSection>

                    <AnimatedSection delay={100}>
                        <Card hover={false} padding="p-8" className="h-full">
                            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-5">
                                <span className="text-white font-bold text-lg">U</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Umbrella</h3>
                            <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                A photography umbrella is an open light modifier shaped like a rain umbrella. It slides into a
                                bracket on a light stand and either reflects or transmits light to soften it.
                            </p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                There are two main types: reflective umbrellas (silver or white interior) that bounce light back
                                toward the subject, and shoot-through umbrellas (translucent white) that let light pass through
                                for softer diffusion. They offer minimal light control but maximum simplicity.
                            </p>
                        </Card>
                    </AnimatedSection>
                </div>
            </Section>

            {/* ===== COMPARISON TABLE ===== */}
            <Section>
                <AnimatedSection>
                    <div className="text-center mb-12">
                        <SectionLabel className="mb-4">Head to Head</SectionLabel>
                        <SectionTitle className="mb-4">Comparison Table</SectionTitle>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={100}>
                    <Card hover={false} padding="p-0" className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-surface-secondary border-b border-border">
                                        <th className="text-left py-4 px-6 font-semibold text-text-primary">Feature</th>
                                        <th className="text-left py-4 px-6 font-semibold text-brand">Softbox</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Umbrella</th>
                                        <th className="text-center py-4 px-6 font-semibold text-text-primary">Winner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((row, i) => (
                                        <tr key={row.feature} className={`border-b border-border-light ${i % 2 === 0 ? '' : 'bg-surface-secondary/50'}`}>
                                            <td className="py-3.5 px-6 font-medium text-text-primary">{row.feature}</td>
                                            <td className="py-3.5 px-6 text-text-secondary">{row.softbox}</td>
                                            <td className="py-3.5 px-6 text-text-secondary">{row.umbrella}</td>
                                            <td className="py-3.5 px-6 text-center">
                                                {row.winner === 'softbox' && (
                                                    <span className="text-xs font-semibold text-brand bg-brand-50 px-2.5 py-1 rounded-full">Softbox</span>
                                                )}
                                                {row.winner === 'umbrella' && (
                                                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">Umbrella</span>
                                                )}
                                                {row.winner === 'tie' && (
                                                    <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full">Tie</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </AnimatedSection>
            </Section>

            {/* ===== PROS & CONS ===== */}
            <Section background="gray">
                <AnimatedSection>
                    <div className="text-center mb-12">
                        <SectionLabel className="mb-4">Analysis</SectionLabel>
                        <SectionTitle className="mb-4">Pros and Cons</SectionTitle>
                    </div>
                </AnimatedSection>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Softbox */}
                    <AnimatedSection>
                        <Card hover={false} padding="p-8" className="h-full">
                            <h3 className="text-lg font-bold text-text-primary mb-6">Softbox</h3>

                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">Pros</p>
                                <ul className="space-y-2.5">
                                    {softboxPros.map((pro) => (
                                        <li key={pro} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-text-secondary">{pro}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-3">Cons</p>
                                <ul className="space-y-2.5">
                                    {softboxCons.map((con) => (
                                        <li key={con} className="flex items-start gap-2.5">
                                            <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                            <span className="text-sm text-text-secondary">{con}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    </AnimatedSection>

                    {/* Umbrella */}
                    <AnimatedSection delay={100}>
                        <Card hover={false} padding="p-8" className="h-full">
                            <h3 className="text-lg font-bold text-text-primary mb-6">Umbrella</h3>

                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">Pros</p>
                                <ul className="space-y-2.5">
                                    {umbrellaPros.map((pro) => (
                                        <li key={pro} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-text-secondary">{pro}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-3">Cons</p>
                                <ul className="space-y-2.5">
                                    {umbrellaCons.map((con) => (
                                        <li key={con} className="flex items-start gap-2.5">
                                            <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                            <span className="text-sm text-text-secondary">{con}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    </AnimatedSection>
                </div>
            </Section>

            {/* ===== BEST USE CASES ===== */}
            <Section>
                <AnimatedSection>
                    <div className="text-center mb-12">
                        <SectionLabel className="mb-4">Recommendations</SectionLabel>
                        <SectionTitle className="mb-4">Best Use Cases</SectionTitle>
                        <p className="text-base text-text-secondary max-w-2xl mx-auto">
                            The right choice depends on your specific scenario. Here is what we recommend for each.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {useCases.map((uc, i) => (
                        <AnimatedSection key={uc.scenario} delay={i * 80}>
                            <Card hover={false} padding="p-6" className="h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                                        <uc.icon className="w-4.5 h-4.5 text-brand" />
                                    </div>
                                    <span
                                        className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${uc.recommendation === 'Softbox'
                                                ? 'bg-brand-50 text-brand'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {uc.recommendation}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-text-primary mb-2">{uc.scenario}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{uc.reason}</p>
                            </Card>
                        </AnimatedSection>
                    ))}
                </div>
            </Section>

            {/* ===== FAQ ===== */}
            <Section background="gray">
                <AnimatedSection>
                    <div className="text-center mb-12">
                        <SectionLabel className="mb-4">FAQ</SectionLabel>
                        <SectionTitle className="mb-4">Frequently Asked Questions</SectionTitle>
                    </div>
                </AnimatedSection>

                <div className="max-w-2xl mx-auto space-y-3">
                    {faqs.map((faq, i) => (
                        <AnimatedSection key={faq.q} delay={i * 40}>
                            <div className="border border-border rounded-xl overflow-hidden bg-white">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-surface-secondary transition-colors"
                                >
                                    <span className="text-sm font-medium text-text-primary pr-4">{faq.q}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 shrink-0 text-text-muted transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-brand' : ''
                                            }`}
                                    />
                                </button>
                                <div className={`transition-all duration-300 overflow-hidden ${openFaq === i ? 'max-h-60' : 'max-h-0'}`}>
                                    <p className="px-6 pb-5 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </Section>

            {/* ===== VERDICT / CTA ===== */}
            <Section>
                <AnimatedSection>
                    <Card hover={false} padding="p-8 sm:p-10" className="border-brand/20">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
                                The Verdict
                            </h2>
                            <p className="text-base text-text-secondary leading-relaxed mb-3">
                                <strong>Choose a softbox</strong> if you work in a studio, shoot portraits or products regularly,
                                and need precise light control with professional-grade results.
                            </p>
                            <p className="text-base text-text-secondary leading-relaxed mb-8">
                                <strong>Choose an umbrella</strong> if you need speed, portability, and affordability — especially
                                for events, on-location work, or if you are just starting out in photography lighting.
                            </p>
                            <p className="text-sm text-text-muted mb-8">
                                Best approach? Own both. Start with an umbrella to learn, then add a softbox when you need more control.
                            </p>
                        </div>
                    </Card>
                </AnimatedSection>
            </Section>

            {/* ===== FINAL CTA ===== */}
            <Section background="dark">
                <AnimatedSection>
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                            Want content like this for your brand?
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">
                            Searchora identifies the exact comparison pages, guides, and FAQ content
                            your brand needs to appear in AI-generated answers.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact">
                                <Button size="lg" icon={ArrowRight} iconPosition="right">
                                    Request an AI Visibility Audit
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="outline" size="lg">
                                    Create Free Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>
        </>
    );
}
