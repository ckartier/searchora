'use client';

import { useState, useEffect } from 'react';
import {
    PenTool, Sparkles, FileText, HelpCircle, Scale, BookOpen,
    Loader2, Copy, Check, Download, RefreshCw, Plus, ChevronDown,
    Zap, Globe,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import {
    collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/* ==================== CONTENT TYPES ==================== */
const contentTypes = [
    {
        id: 'faq', label: 'FAQ Page', icon: HelpCircle,
        description: 'Generate Q&A content optimized for AI citation',
        prompt: (topic, company, industry) =>
            `Generate a comprehensive FAQ page about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}. 
Include 8-12 questions and detailed answers. Each answer should be 2-4 sentences, factual, and structured for AI retrieval. 
Start each answer with a direct response. Use markdown formatting with ## for section headers and **bold** for emphasis.
Format as clean markdown with clear Q&A structure.`,
    },
    {
        id: 'comparison', label: 'Comparison Article', icon: Scale,
        description: 'vs-style content for competitive AI queries',
        prompt: (topic, company, industry) =>
            `Write a detailed comparison article about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Include: introduction, overview of both options, detailed feature comparison table in markdown, pros/cons for each, use cases, 
and a conclusion with recommendation. The tone should be objective and informative.
Use markdown formatting. This content should be optimized for AI tools to cite in "vs" queries.`,
    },
    {
        id: 'guide', label: 'Complete Guide', icon: BookOpen,
        description: 'In-depth educational content for topical authority',
        prompt: (topic, company, industry) =>
            `Write a comprehensive guide about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Include: introduction with a clear definition, 5-7 main sections with headers, practical tips, examples, 
and a conclusion. Each section should have 100-200 words. Use markdown formatting with ## headers.
Start with a brief answer paragraph that directly addresses the topic (answer-first format).
This content should build topical authority and be ideal for AI citation.`,
    },
    {
        id: 'definition', label: 'Glossary / Definitions', icon: FileText,
        description: 'Term definitions for "What is X?" queries',
        prompt: (topic, company, industry) =>
            `Create a glossary page defining key terms related to "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Include 10-15 terms with clear, concise definitions (2-3 sentences each). Start each definition with "X is..." format.
Use markdown formatting with ## for each term. Make definitions factual and citation-worthy for AI tools.`,
    },
    {
        id: 'howto', label: 'How-To Article', icon: Zap,
        description: 'Step-by-step instructional content',
        prompt: (topic, company, industry) =>
            `Write a step-by-step how-to guide about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Start with a brief overview (what the reader will learn and why it matters).
Then provide 5-8 numbered steps with clear instructions. Each step should have a heading and 2-3 sentences.
Include tips and common mistakes to avoid. Use markdown formatting.`,
    },
];

const GEMINI_KEY_CLIENT = null; // API calls go through server

export default function ContentGeneratorPage() {
    const { user } = useAuth();
    const [selectedType, setSelectedType] = useState('faq');
    const [topic, setTopic] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Load history from Firestore
    useEffect(() => {
        async function loadHistory() {
            if (!user?.uid) { setLoadingHistory(false); return; }
            try {
                const q = query(
                    collection(db, 'generated_content'),
                    where('userId', '==', user.uid),
                );
                const snap = await getDocs(q);
                const items = snap.docs
                    .map((d) => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => {
                        const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                        const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                        return tb - ta;
                    })
                    .slice(0, 10);
                setHistory(items);
            } catch (err) {
                console.error('Failed to load content history:', err);
            }
            setLoadingHistory(false);
        }
        loadHistory();
    }, [user?.uid]);

    // Load profile company name
    useEffect(() => {
        async function loadProfile() {
            if (!user?.uid) return;
            try {
                const { getDoc, doc } = await import('firebase/firestore');
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.companyName) setCompanyName(data.companyName);
                    if (data.industry) setIndustry(data.industry);
                }
            } catch { }
        }
        loadProfile();
    }, [user?.uid]);

    /* ==================== GENERATE CONTENT ==================== */
    const generateContent = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setError(null);
        setGeneratedContent('');

        const contentType = contentTypes.find((ct) => ct.id === selectedType);
        const fullPrompt = contentType.prompt(topic, companyName, industry);

        try {
            const resp = await fetch('/api/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    topic,
                    contentType: selectedType,
                    companyName,
                    industry,
                }),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || 'Generation failed');
            }

            const data = await resp.json();
            setGeneratedContent(data.content);

            // Save to Firestore
            if (user?.uid) {
                try {
                    await addDoc(collection(db, 'generated_content'), {
                        userId: user.uid,
                        topic,
                        contentType: selectedType,
                        companyName,
                        industry,
                        content: data.content?.substring(0, 10000),
                        wordCount: data.content?.split(/\s+/).length || 0,
                        createdAt: serverTimestamp(),
                    });
                } catch (saveErr) {
                    console.error('Failed to save content:', saveErr);
                }
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    /* ==================== COPY ==================== */
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /* ==================== RENDER ==================== */
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Content Generator</h1>
                <p className="text-sm text-text-secondary mt-1">
                    Generate AI-optimized content designed to be cited by AI assistants.
                </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left — Controls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content type selector */}
                    <Card hover={false} padding="p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Content Type</h3>
                        <div className="space-y-2">
                            {contentTypes.map((ct) => (
                                <button
                                    key={ct.id}
                                    onClick={() => setSelectedType(ct.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${selectedType === ct.id
                                        ? 'bg-brand-50 border border-brand-200 shadow-sm'
                                        : 'bg-surface-secondary hover:bg-surface-secondary/80 border border-transparent'
                                        }`}
                                >
                                    <ct.icon className={`w-5 h-5 shrink-0 ${selectedType === ct.id ? 'text-brand' : 'text-text-muted'
                                        }`} />
                                    <div>
                                        <p className={`text-sm font-medium ${selectedType === ct.id ? 'text-brand' : 'text-text-primary'
                                            }`}>{ct.label}</p>
                                        <p className="text-[10px] text-text-muted">{ct.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Topic & context */}
                    <Card hover={false} padding="p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Content Details</h3>
                        <div className="space-y-3">
                            <Input
                                label="Topic / Title"
                                placeholder="e.g. softbox vs umbrella for portrait lighting"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                            <Input
                                label="Company Name"
                                placeholder="Your brand"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                            <Input
                                label="Industry"
                                placeholder="Photography, SaaS, etc."
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                            />
                        </div>
                    </Card>

                    <Button
                        size="lg"
                        icon={loading ? Loader2 : Sparkles}
                        onClick={generateContent}
                        disabled={!topic.trim() || loading}
                        className="w-full shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
                    >
                        {loading ? 'Generating...' : 'Generate Content'}
                    </Button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right — Output */}
                <div className="lg:col-span-3 space-y-4">
                    {generatedContent ? (
                        <>
                            {/* Toolbar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        {generatedContent.split(/\s+/).length} words
                                    </span>
                                    <span className="text-[10px] font-medium text-brand bg-brand-50 px-2 py-1 rounded-full">
                                        {contentTypes.find(ct => ct.id === selectedType)?.label}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" icon={copied ? Check : Copy}
                                        onClick={copyToClipboard}>
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                    <Button variant="secondary" size="sm" icon={RefreshCw}
                                        onClick={generateContent}
                                        disabled={loading}>
                                        Regenerate
                                    </Button>
                                </div>
                            </div>

                            {/* Content preview */}
                            <Card hover={false} padding="p-6" className="min-h-[400px]">
                                <div className="prose prose-sm max-w-none">
                                    <div
                                        className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap"
                                        style={{ fontFamily: 'system-ui' }}
                                    >
                                        {generatedContent}
                                    </div>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <Card hover={false} padding="p-12" className="text-center min-h-[400px] flex items-center justify-center">
                            <div>
                                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <PenTool className="w-8 h-8 text-brand" />
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">
                                    AI-Optimized Content
                                </h3>
                                <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                                    Choose a content type, enter your topic, and generate content
                                    structured for maximum AI citation potential.
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* History */}
                    {history.length > 0 && !generatedContent && (
                        <Card hover={false} padding="p-5">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Generations</h3>
                            <div className="space-y-2">
                                {history.map((item) => {
                                    const ct = contentTypes.find(c => c.id === item.contentType);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setGeneratedContent(item.content || '');
                                                setTopic(item.topic || '');
                                                setSelectedType(item.contentType || 'faq');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 bg-surface-secondary rounded-xl text-left hover:bg-surface-secondary/80 transition-colors cursor-pointer"
                                        >
                                            {ct && <ct.icon className="w-4 h-4 text-text-muted shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-text-primary truncate">{item.topic}</p>
                                                <p className="text-[10px] text-text-muted">
                                                    {ct?.label || item.contentType} · {item.wordCount || 0} words
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
