'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();
    const { t } = useI18n();

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            await signUp(form.email, form.password, form.name, form.company);
            router.push('/dashboard');
        } catch (err) {
            setError(err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : 'Something went wrong.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center section-padding py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(249,115,22,0.3)]">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">{t('auth.signupTitle')}</h1>
                    <p className="text-sm text-text-secondary">{t('auth.signupSubtitle')}</p>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

                        <Input label={t('auth.fullName')} name="name" placeholder="John Doe" icon={User} value={form.name} onChange={handleChange} required />
                        <Input label={t('auth.email')} name="email" type="email" placeholder="you@company.com" icon={Mail} value={form.email} onChange={handleChange} required />
                        <Input label={t('auth.company')} name="company" placeholder="Acme Inc." icon={Building2} value={form.company} onChange={handleChange} />
                        <Input label={t('auth.password')} name="password" type="password" placeholder="Min. 8 characters" icon={Lock} value={form.password} onChange={handleChange} required />
                        <Input label={t('auth.confirmPassword')} name="confirmPassword" type="password" placeholder="••••••••" icon={Lock} value={form.confirmPassword} onChange={handleChange} required />

                        <Button type="submit" size="lg" className="w-full" loading={loading} icon={ArrowRight} iconPosition="right">
                            {t('auth.signup')}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-text-secondary mt-6">
                    {t('auth.haveAccount')}{' '}
                    <Link href="/login" className="text-brand font-medium hover:text-brand-hover transition-colors">{t('auth.logInLink')}</Link>
                </p>
            </div>
        </div>
    );
}
