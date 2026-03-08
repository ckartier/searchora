'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();
    const { t } = useI18n();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center section-padding py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <Image src="/logo.png" alt="Searchora" width={44} height={44} />
                    </Link>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">{t('auth.loginTitle')}</h1>
                    <p className="text-sm text-text-secondary">{t('auth.loginSubtitle')}</p>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        <Input
                            label={t('auth.email')}
                            type="email"
                            placeholder="you@company.com"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label={t('auth.password')}
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="flex items-center justify-end">
                            <Link href="/forgot-password" className="text-sm text-brand font-medium hover:text-brand-hover transition-colors">
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>

                        <Button type="submit" size="lg" className="w-full" loading={loading} icon={ArrowRight} iconPosition="right">
                            {t('auth.login')}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-text-secondary mt-6">
                    {t('auth.noAccount')}{' '}
                    <Link href="/signup" className="text-brand font-medium hover:text-brand-hover transition-colors">
                        {t('auth.signUpLink')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
