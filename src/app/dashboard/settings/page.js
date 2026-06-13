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
import { useI18n } from '@/lib/i18n';
import {
    doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where,
    getDocs, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/* ==================== PLANS ==================== */
const plans = [
    {
        id: 'free', name: 'Free', price: '0', period: '/month',
        featureKeys: ['settingsPage.pfFree1', 'settingsPage.pfFree2', 'settingsPage.pfFree3'],
        color: 'bg-gray-50 border-gray-200',
    },
    {
        id: 'starter', name: 'Starter', price: '29', period: '/month',
        featureKeys: ['settingsPage.pfStarter1', 'settingsPage.pfStarter2', 'settingsPage.pfStarter3', 'settingsPage.pfStarter4'],
        color: 'bg-blue-50 border-blue-200', popular: true,
    },
    {
        id: 'growth', name: 'Growth', price: '79', period: '/month',
        featureKeys: ['settingsPage.pfGrowth1', 'settingsPage.pfGrowth2', 'settingsPage.pfGrowth3', 'settingsPage.pfGrowth4', 'settingsPage.pfGrowth5'],
        color: 'bg-brand-50 border-brand-200',
    },
    {
        id: 'enterprise', name: 'Enterprise', price: '249', period: '/month',
        featureKeys: ['settingsPage.pfEnt1', 'settingsPage.pfEnt2', 'settingsPage.pfEnt3', 'settingsPage.pfEnt4', 'settingsPage.pfEnt5'],
        color: 'bg-purple-50 border-purple-200',
    },
];

export default function SettingsPage() {
    const { user } = useAuth();
    const { t } = useI18n();
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
        { id: 'profile', label: t('settingsPage.tabProfile'), icon: User },
        { id: 'billing', label: t('settingsPage.tabBilling'), icon: CreditCard },
        { id: 'notifications', label: t('settingsPage.tabNotifications'), icon: Bell },
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
    }, [user?.uid, user?.displayName, user?.email]);

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
                <h1 className="text-2xl font-bold text-text-primary">{t('settingsPage.title')}</h1>
                <p className="text-sm text-text-secondary mt-0.5">{t('settingsPage.subtitle')}</p>
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
                    <h2 className="text-lg font-semibold text-text-primary mb-6">{t('settingsPage.profileInfo')}</h2>
                    <div className="space-y-4 max-w-lg">
                        <Input
                            label={t('settingsPage.fullName')}
                            value={profile.displayName}
                            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                            icon={User}
                        />
                        <Input
                            label={t('settingsPage.email')}
                            value={profile.email}
                            disabled
                        />
                        <Input
                            label={t('settingsPage.companyName')}
                            value={profile.companyName}
                            onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                            placeholder="Your company"
                        />
                        <Input
                            label={t('settingsPage.website')}
                            value={profile.website}
                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                            placeholder="https://yourcompany.com"
                        />
                        <Input
                            label={t('settingsPage.industry')}
                            value={profile.industry}
                            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                            placeholder="SaaS, E-commerce, etc."
                        />
                        <Input
                            label={t('settingsPage.country')}
                            value={profile.country}
                            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                            placeholder="France, US, etc."
                        />
                        <Button
                            icon={saved ? Check : saving ? Loader2 : Save}
                            onClick={saveProfile}
                            disabled={saving}
                        >
                            {saved ? t('settingsPage.saved') : saving ? t('settingsPage.saving') : t('settingsPage.saveChanges')}
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
                                <Crown className="w-5 h-5 text-brand shrink-0" />
                                <div>
                                    <h3 className="text-base font-semibold text-text-primary">{t('settingsPage.currentPlan')}: {currentPlan.name}</h3>
                                    <p className="text-xs text-text-muted">
                                        {subscription?.status === 'active' ? t('settingsPage.active') : t('settingsPage.inactive')}
                                        {subscription?.startedAt && ` · ${t('settingsPage.since')} ${new Date(subscription.startedAt).toLocaleDateString()}`}
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
                                <p className="text-xs text-text-muted">{t('settingsPage.auditsRan')}</p>
                                <p className="text-lg font-bold text-text-primary">{usage.audits}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">{t('settingsPage.presenceTests')}</p>
                                <p className="text-lg font-bold text-text-primary">{usage.presenceTests}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Plan selection */}
                    <h3 className="text-sm font-semibold text-text-primary">{t('settingsPage.availablePlans')}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => {
                            const isActive = plan.id === (subscription?.plan || 'free');
                            return (
                                <Card key={plan.id} hover={!isActive} padding="p-5"
                                    className={`relative ${isActive ? 'ring-2 ring-brand' : ''}`}>
                                    {plan.popular && (
                                        <span className="absolute -top-2 right-3 text-[10px] font-bold text-white bg-brand px-2 py-0.5 rounded-full">
                                            {t('settingsPage.popular')}
                                        </span>
                                    )}
                                    <h4 className="text-sm font-semibold text-text-primary mb-1">{plan.name}</h4>
                                    <div className="mb-3">
                                        <span className="text-2xl font-bold text-text-primary">${plan.price}</span>
                                        <span className="text-xs text-text-muted">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-1.5 mb-4">
                                        {plan.featureKeys.map((f) => (
                                            <li key={f} className="text-xs text-text-secondary flex items-center gap-1.5">
                                                <Check className="w-3 h-3 text-green-500 shrink-0" /> {t(f)}
                                            </li>
                                        ))}
                                    </ul>
                                    {isActive ? (
                                        <div className="text-xs font-medium text-brand text-center py-2 bg-brand-50 rounded-lg">
                                            {t('settingsPage.currentPlanBadge')}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => changePlan(plan.id)}
                                        >
                                            {plan.price === '0' ? t('settingsPage.downgrade') : t('settingsPage.upgrade')}
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
                    <h2 className="text-lg font-semibold text-text-primary mb-6">{t('settingsPage.notifPrefs')}</h2>
                    <div className="space-y-4">
                        {[
                            { label: t('settingsPage.notifWeekly'), description: t('settingsPage.notifWeeklyDesc') },
                            { label: t('settingsPage.notifCitations'), description: t('settingsPage.notifCitationsDesc') },
                            { label: t('settingsPage.notifCompetitors'), description: t('settingsPage.notifCompetitorsDesc') },
                            { label: t('settingsPage.notifRecs'), description: t('settingsPage.notifRecsDesc') },
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
