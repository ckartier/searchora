'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [error, setError] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('loading');
        try {
            await resetPassword(email);
            setStatus('success');
        } catch (err) {
            setError('Could not send reset email. Please check the address and try again.');
            setStatus('error');
        }
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
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Reset your password</h1>
                    <p className="text-sm text-text-secondary">
                        Enter your email and we will send you a reset link.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                    {status === 'success' ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-7 h-7 text-green-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-text-primary mb-2">Check your email</h2>
                            <p className="text-sm text-text-secondary mb-6">
                                We have sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <Link href="/login">
                                <Button variant="secondary" icon={ArrowLeft}>
                                    Back to login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@company.com"
                                icon={Mail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                loading={status === 'loading'}
                                icon={ArrowRight}
                                iconPosition="right"
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    )}
                </div>

                <p className="text-center text-sm text-text-secondary mt-6">
                    <Link href="/login" className="text-brand font-medium hover:text-brand-hover transition-colors inline-flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
}
