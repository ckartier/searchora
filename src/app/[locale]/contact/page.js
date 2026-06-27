'use client';

import { useState } from 'react';
import { ArrowRight, Mail, Building2, Globe, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { SectionLabel } from '@/components/ui/Section';
import { useI18n } from '@/lib/i18n';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', company: '', website: '', message: '' });
    const [status, setStatus] = useState('idle');
    const { t } = useI18n();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        await new Promise((r) => setTimeout(r, 1500));
        setStatus('success');
    };

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <section className="bg-white pt-12 pb-20 lg:pb-28 section-padding">
            <div className="container-wide">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                    <AnimatedSection>
                        <div className="max-w-lg">
                            <SectionLabel className="mb-4">{t('nav.contact')}</SectionLabel>
                            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
                                {t('contact.title')}
                            </h1>
                            <p className="text-lg text-text-secondary leading-relaxed mb-10">
                                {t('contact.subtitle')}
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary mb-1">Email</h3>
                                        <p className="text-sm text-text-secondary">hello@searchora.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary mb-1">Response time</h3>
                                        <p className="text-sm text-text-secondary">We typically respond within 4 hours.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Globe className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary mb-1">Worldwide</h3>
                                        <p className="text-sm text-text-secondary">We work with brands globally.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={200}>
                        {status === 'success' ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ArrowRight className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-text-primary mb-2">{t('contact.successTitle')}</h2>
                                <p className="text-sm text-text-secondary">{t('contact.successDesc')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="bg-surface-secondary rounded-2xl border border-border p-8">
                                    <h2 className="text-lg font-semibold text-text-primary mb-6">{t('nav.requestAudit')}</h2>

                                    <div className="space-y-4">
                                        <Input label={t('contact.nameLabel')} name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                                        <Input label={t('contact.emailLabel')} name="email" type="email" placeholder="john@company.com" icon={Mail} value={form.email} onChange={handleChange} required />
                                        <Input label={t('contact.companyLabel')} name="company" placeholder="Acme Inc." icon={Building2} value={form.company} onChange={handleChange} required />
                                        <Input label="Website URL" name="website" placeholder="https://acme.com" icon={Globe} value={form.website} onChange={handleChange} />
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-text-primary">{t('contact.messageLabel')}</label>
                                            <textarea
                                                name="message"
                                                rows={4}
                                                value={form.message}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-gray-300 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full mt-6" loading={status === 'loading'} icon={ArrowRight} iconPosition="right">
                                        {t('contact.send')}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
}
