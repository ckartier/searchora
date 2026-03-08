'use client';

import { useState, useEffect } from 'react';
import {
    Settings, User, Bell, Shield, CreditCard, Save, Check,
    Loader2, Crown, Zap, Star,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import {
    doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where,
    getDocs, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/* ==================== PLANS ==================== */
const plans = [
    {
        id: 'free', name: 'Free', price: '0', period: '/month',
        features: ['1 audit/month', '3 presence tests/month', 'Basic reports'],
        color: 'bg-gray-50 border-gray-200',
    },
    {
        id: 'starter', name: 'Starter', price: '29', period: '/month',
        features: ['5 audits/month', '20 presence tests/month', 'Full reports', 'Content Generator'],
        color: 'bg-blue-50 border-blue-200', popular: true,
    },
    {
        id: 'growth', name: 'Growth', price: '79', period: '/month',
        features: ['Unlimited audits', 'Unlimited presence tests', 'Priority AI', 'Content Generator', 'API access'],
        color: 'bg-brand-50 border-brand-200',
    },
    {
        id: 'enterprise', name: 'Enterprise', price: '249', period: '/month',
        features: ['Everything in Growth', 'White-label reports', 'Dedicated support', 'Custom integrations', 'Team accounts'],
        color: 'bg-purple-50 border-purple-200',
    },
];

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile fields — loaded from Firestore
    const [profile, setProfile] = useState({
        displayName: '',
        email: '',
        companyName: '',
        website: '',
        industry: '',
        country: '',
    });

    // Subscription
    const [subscription, setSubscription] = useState(null);

    // Usage stats
    const [usage, setUsage] = useState({ audits: 0, presenceTests: 0 });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'billing', label: 'Subscription', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    /* ==================== LOAD DATA ==================== */
    useEffect(() => {
        async function loadData() {
            if (!user?.uid) return;

            // Load profile from Firestore
            try {
                const profileRef = doc(db, 'users', user.uid);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    const data = profileSnap.data();
                    setProfile({
                        displayName: data.displayName || user.displayName || '',
                        email: data.email || user.email || '',
                        companyName: data.companyName || '',
                        website: data.website || '',
                        industry: data.industry || '',
                        country: data.country || '',
                    });
                    setSubscription(data.subscription || { plan: 'free', status: 'active' });
                } else {
                    // First time — create profile document
                    const defaultProfile = {
                        displayName: user.displayName || '',
                        email: user.email || '',
                        companyName: '',
                        website: '',
                        industry: '',
                        country: '',
                        subscription: { plan: 'free', status: 'active', startedAt: new Date().toISOString() },
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };
                    await setDoc(profileRef, defaultProfile);
                    setProfile({
                        displayName: defaultProfile.displayName,
                        email: defaultProfile.email,
                        companyName: '',
                        website: '',
                        industry: '',
                        country: '',
                    });
                    setSubscription(defaultProfile.subscription);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setProfile({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    companyName: '', website: '', industry: '', country: '',
                });
                setSubscription({ plan: 'free', status: 'active' });
            }

            // Load usage stats
            try {
                const auditQ = query(
                    collection(db, 'audits'),
                    where('userId', '==', user.uid),
                );
                const auditSnap = await getDocs(auditQ);

                const presenceQ = query(
                    collection(db, 'presence_tests'),
                    where('userId', '==', user.uid),
                );
                const presenceSnap = await getDocs(presenceQ).catch(() => ({ size: 0 }));

                setUsage({
                    audits: auditSnap.size,
                    presenceTests: presenceSnap.size || 0,
                });
            } catch (err) {
                console.error('Error loading usage:', err);
            }
        }
        loadData();
    }, [user?.uid]);

    /* ==================== SAVE PROFILE ==================== */
    const saveProfile = async () => {
        if (!user?.uid) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: profile.displayName,
                companyName: profile.companyName,
                website: profile.website,
                industry: profile.industry,
                country: profile.country,
                updatedAt: serverTimestamp(),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Error saving profile:', err);
        }
        setSaving(false);
    };

    /* ==================== CHANGE PLAN ==================== */
    const changePlan = async (planId) => {
        if (!user?.uid) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                subscription: {
                    plan: planId,
                    status: 'active',
                    startedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                updatedAt: serverTimestamp(),
            });
            setSubscription({ plan: planId, status: 'active', startedAt: new Date().toISOString() });
        } catch (err) {
            console.error('Error changing plan:', err);
        }
    };

    const currentPlan = plans.find((p) => p.id === (subscription?.plan || 'free')) || plans[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
                <p className="text-sm text-text-secondary mt-0.5">Manage your account, subscription, and preferences</p>
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

            {/* ==================== PROFILE TAB ==================== */}
            {activeTab === 'profile' && (
                <Card hover={false} padding="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">Profile Information</h2>
                    <div className="space-y-4 max-w-lg">
                        <Input
                            label="Full Name"
                            value={profile.displayName}
                            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                            icon={User}
                        />
                        <Input
                            label="Email"
                            value={profile.email}
                            disabled
                        />
                        <Input
                            label="Company Name"
                            value={profile.companyName}
                            onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                            placeholder="Your company"
                        />
                        <Input
                            label="Website"
                            value={profile.website}
                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                            placeholder="https://yourcompany.com"
                        />
                        <Input
                            label="Industry"
                            value={profile.industry}
                            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                            placeholder="SaaS, E-commerce, etc."
                        />
                        <Input
                            label="Country"
                            value={profile.country}
                            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                            placeholder="France, US, etc."
                        />
                        <Button
                            icon={saved ? Check : saving ? Loader2 : Save}
                            onClick={saveProfile}
                            disabled={saving}
                        >
                            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* ==================== BILLING TAB ==================== */}
            {activeTab === 'billing' && (
                <div className="space-y-6">
                    {/* Current plan */}
                    <Card hover={false} padding="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-brand" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Current Plan: {currentPlan.name}</h3>
                                    <p className="text-xs text-text-muted">
                                        {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                                        {subscription?.startedAt && ` · Since ${new Date(subscription.startedAt).toLocaleDateString()}`}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-text-primary">${currentPlan.price}</span>
                                <span className="text-sm text-text-muted">{currentPlan.period}</span>
                            </div>
                        </div>

                        {/* Usage */}
                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-surface-secondary rounded-xl">
                            <div>
                                <p className="text-xs text-text-muted">Audits ran</p>
                                <p className="text-lg font-bold text-text-primary">{usage.audits}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">Presence tests</p>
                                <p className="text-lg font-bold text-text-primary">{usage.presenceTests}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Plan selection */}
                    <h3 className="text-sm font-semibold text-text-primary">Available Plans</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => {
                            const isActive = plan.id === (subscription?.plan || 'free');
                            return (
                                <Card key={plan.id} hover={!isActive} padding="p-5"
                                    className={`relative ${isActive ? 'ring-2 ring-brand' : ''}`}>
                                    {plan.popular && (
                                        <span className="absolute -top-2 right-3 text-[10px] font-bold text-white bg-brand px-2 py-0.5 rounded-full">
                                            POPULAR
                                        </span>
                                    )}
                                    <h4 className="text-sm font-semibold text-text-primary mb-1">{plan.name}</h4>
                                    <div className="mb-3">
                                        <span className="text-2xl font-bold text-text-primary">${plan.price}</span>
                                        <span className="text-xs text-text-muted">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-1.5 mb-4">
                                        {plan.features.map((f) => (
                                            <li key={f} className="text-xs text-text-secondary flex items-center gap-1.5">
                                                <Check className="w-3 h-3 text-green-500 shrink-0" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    {isActive ? (
                                        <div className="text-xs font-medium text-brand text-center py-2 bg-brand-50 rounded-lg">
                                            Current Plan
                                        </div>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => changePlan(plan.id)}
                                        >
                                            {plan.price === '0' ? 'Downgrade' : 'Upgrade'}
                                        </Button>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ==================== NOTIFICATIONS TAB ==================== */}
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
        </div>
    );
}
