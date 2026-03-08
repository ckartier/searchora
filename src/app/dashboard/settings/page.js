'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, CreditCard, Save } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
                <p className="text-sm text-text-secondary mt-0.5">Manage your account and preferences</p>
            </div>

            <div className="flex gap-2 border-b border-border pb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${activeTab === tab.id
                                ? 'text-brand border-brand'
                                : 'text-text-secondary border-transparent hover:text-text-primary'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && (
                <Card hover={false} padding="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">Profile Information</h2>
                    <div className="space-y-4 max-w-lg">
                        <Input
                            label="Full Name"
                            defaultValue={user?.displayName || 'Demo User'}
                            icon={User}
                        />
                        <Input
                            label="Email"
                            defaultValue={user?.email || 'demo@searchora.com'}
                            disabled
                        />
                        <Input
                            label="Company Name"
                            defaultValue="Acme CRM"
                        />
                        <Input
                            label="Website"
                            defaultValue="https://acmecrm.com"
                        />
                        <Button icon={Save} iconPosition="left">
                            Save Changes
                        </Button>
                    </div>
                </Card>
            )}

            {activeTab === 'notifications' && (
                <Card hover={false} padding="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                        {[
                            { label: 'Weekly visibility reports', description: 'Receive a weekly summary of your AI visibility score' },
                            { label: 'New citation alerts', description: 'Get notified when your brand is cited in a new AI answer' },
                            { label: 'Competitor alerts', description: 'Get notified when competitors gain or lose visibility' },
                            { label: 'Recommendation updates', description: 'New recommendations based on latest analysis' },
                        ].map((pref) => (
                            <div key={pref.label} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl">
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{pref.label}</p>
                                    <p className="text-xs text-text-muted">{pref.description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:bg-brand transition-colors">
                                        <div className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4" />
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === 'security' && (
                <Card hover={false} padding="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">Security</h2>
                    <div className="space-y-4 max-w-lg">
                        <Input label="Current Password" type="password" placeholder="••••••••" />
                        <Input label="New Password" type="password" placeholder="Min. 8 characters" />
                        <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                        <Button icon={Save}>Update Password</Button>
                    </div>
                </Card>
            )}

            {activeTab === 'billing' && (
                <Card hover={false} padding="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">Billing</h2>
                    <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Growth Plan</p>
                                <p className="text-xs text-text-muted">$1,290/month · Renews Mar 15, 2025</p>
                            </div>
                            <Button variant="secondary" size="sm">Manage</Button>
                        </div>
                    </div>
                    <p className="text-sm text-text-secondary">
                        Need a different plan? <a href="/pricing" className="text-brand font-medium hover:underline">View pricing</a> or contact our sales team.
                    </p>
                </Card>
            )}
        </div>
    );
}
