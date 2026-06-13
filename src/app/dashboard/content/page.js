'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    PenTool, Sparkles, FileText, HelpCircle, Scale, BookOpen,
    Loader2, Copy, Check, RefreshCw, Plus, Zap, Download,
    Clock, Trash2, ChevronRight, ArrowLeft, Eye, Share2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import {
    collection, addDoc, getDocs, getDoc, doc, deleteDoc,
    query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/apiClient';

/* ==================== CONTENT TYPES ==================== */
const contentTypes = [
    {
        id: 'faq', label: 'FAQ Page', icon: HelpCircle,
        labelKey: 'contentGen.typeFaqLabel', descKey: 'contentGen.typeFaqDesc',
        prompt: (topic, company, industry) =>
            `Generate a comprehensive FAQ page about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}. 
Include 8-12 questions and detailed answers. Each answer should be 2-4 sentences, factual, and structured for AI retrieval. 
Start each answer with a direct response. Use markdown formatting with ## for section headers and **bold** for emphasis.
Format as clean markdown with clear Q&A structure.`,
    },
    {
        id: 'comparison', label: 'Comparison Article', icon: Scale,
        labelKey: 'contentGen.typeComparisonLabel', descKey: 'contentGen.typeComparisonDesc',
        prompt: (topic, company, industry) =>
            `Write a detailed comparison article about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Include: introduction, overview of both options, detailed feature comparison table in markdown, pros/cons for each, use cases, 
and a conclusion with recommendation. The tone should be objective and informative.
Use markdown formatting. This content should be optimized for AI tools to cite in "vs" queries.`,
    },
    {
        id: 'guide', label: 'Complete Guide', icon: BookOpen,
        labelKey: 'contentGen.typeGuideLabel', descKey: 'contentGen.typeGuideDesc',
        prompt: (topic, company, industry) =>
            `Write a comprehensive guide about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Include: introduction with a clear definition, 5-7 main sections with headers, practical tips, examples, 
and a conclusion. Each section should have 100-200 words. Use markdown formatting with ## headers.
Start with a brief answer paragraph that directly addresses the topic (answer-first format).
This content should build topical authority and be ideal for AI citation.`,
    },
    {
        id: 'definition', label: 'Glossary / Definitions', icon: FileText,
        labelKey: 'contentGen.typeDefinitionLabel', descKey: 'contentGen.typeDefinitionDesc',
        prompt: (topic, company, industry) =>
            `Create a glossary page defining key terms related to "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Include 10-15 terms with clear, concise definitions (2-3 sentences each). Start each definition with "X is..." format.
Use markdown formatting with ## for each term. Make definitions factual and citation-worthy for AI tools.`,
    },
    {
        id: 'howto', label: 'How-To Article', icon: Zap,
        labelKey: 'contentGen.typeHowtoLabel', descKey: 'contentGen.typeHowtoDesc',
        prompt: (topic, company, industry) =>
            `Write a step-by-step how-to guide about "${topic}" for ${company || 'a business'} in ${industry || 'their industry'}.
Start with a brief overview (what the reader will learn and why it matters).
Then provide 5-8 numbered steps with clear instructions. Each step should have a heading and 2-3 sentences.
Include tips and common mistakes to avoid. Use markdown formatting.`,
    },
];

/* ==================== VIEWS ==================== */
const VIEW_FORM = 'form';
const VIEW_RESULT = 'result';
const VIEW_HISTORY = 'history';
const VIEW_DETAIL = 'detail';

const dateLocales = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' };

export default function ContentGeneratorPage() {
    const { user } = useAuth();
    const { t, lang } = useI18n();
    const dateLocale = dateLocales[lang] || 'en-US';
    const [view, setView] = useState(VIEW_FORM);

    // Form state
    const [selectedType, setSelectedType] = useState('faq');
    const [topic, setTopic] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');

    // Generation state
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [currentDocId, setCurrentDocId] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // History state
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    // Load profile
    useEffect(() => {
        async function loadProfile() {
            if (!user?.uid) return;
            try {
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

    // Load history
    const loadHistory = useCallback(async () => {
        if (!user?.uid) { setLoadingHistory(false); return; }
        try {
            const q = query(collection(db, 'generated_content'), where('userId', '==', user.uid));
            const snap = await getDocs(q);
            const items = snap.docs
                .map((d) => {
                    const data = d.data();
                    let createdAt = data.createdAt;
                    if (createdAt?.toDate) createdAt = createdAt.toDate().toISOString();
                    return { id: d.id, ...data, createdAt };
                })
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setHistory(items);
        } catch (err) {
            console.error('Failed to load content history:', err);
        }
        setLoadingHistory(false);
    }, [user?.uid]);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    /* ==================== GENERATE CONTENT ==================== */
    const generateContent = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setError(null);
        setGeneratedContent('');

        const contentType = contentTypes.find((ct) => ct.id === selectedType);
        const fullPrompt = contentType.prompt(topic, companyName, industry);

        try {
            const resp = await authFetch('/api/generate-content', {
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

            // Save FULL content to Firestore
            if (user?.uid) {
                try {
                    const docRef = await addDoc(collection(db, 'generated_content'), {
                        userId: user.uid,
                        topic,
                        contentType: selectedType,
                        contentTypeLabel: contentType.label,
                        companyName,
                        industry,
                        content: data.content, // Full content — no truncation
                        wordCount: data.content?.split(/\s+/).length || 0,
                        charCount: data.content?.length || 0,
                        status: 'generated',
                        createdAt: serverTimestamp(),
                    });
                    setCurrentDocId(docRef.id);
                    // Reload history
                    loadHistory();
                } catch (saveErr) {
                    console.error('Failed to save content:', saveErr);
                }
            }

            setView(VIEW_RESULT);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    /* ==================== COPY ==================== */
    const copyContent = (text) => {
        navigator.clipboard.writeText(text || generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /* ==================== EXPORT ==================== */
    const exportMarkdown = (item) => {
        const content = item?.content || generatedContent;
        const title = item?.topic || topic;
        const type = item?.contentTypeLabel || contentTypes.find(ct => ct.id === selectedType)?.label || '';
        const company = item?.companyName || companyName;

        const header = `---
title: "${title}"
type: "${type}"
company: "${company}"
industry: "${item?.industry || industry}"
generated: "${item?.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()}"
words: ${content?.split(/\s+/).length || 0}
---

`;
        const fullContent = header + content;
        const blob = new Blob([fullContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportHTML = (item) => {
        const content = item?.content || generatedContent;
        const title = item?.topic || topic;
        const company = item?.companyName || companyName;

        // Simple markdown to HTML
        let html = content
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/---/g, '<hr>');

        const fullHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — ${company}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.7; color: #1a1a1a; }
        h1 { font-size: 2em; margin-bottom: 0.5em; color: #111; }
        h2 { font-size: 1.4em; margin-top: 2em; color: #222; border-bottom: 2px solid #f97316; padding-bottom: 8px; }
        h3 { font-size: 1.1em; color: #333; }
        p { margin: 1em 0; }
        strong { color: #111; }
        li { margin: 0.5em 0; padding-left: 4px; }
        hr { border: none; border-top: 1px solid #eee; margin: 2em 0; }
        .meta { background: #f8f8f8; padding: 16px; border-radius: 8px; margin-bottom: 2em; font-size: 0.85em; color: #666; }
    </style>
</head>
<body>
    <div class="meta">
        <strong>${company}</strong> · ${title} · Generated by Searchora
    </div>
    <p>${html}</p>
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ==================== DELETE ITEM ==================== */
    const deleteItem = async (id) => {
        if (!confirm(t('contentGen.confirmDelete'))) return;
        try {
            await deleteDoc(doc(db, 'generated_content', id));
            setHistory(history.filter(h => h.id !== id));
            if (selectedHistoryItem?.id === id) {
                setSelectedHistoryItem(null);
                setView(VIEW_HISTORY);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    /* ==================== LOADING STATE ==================== */
    if (loading) {
        return (
            <div className="max-w-md mx-auto space-y-6 py-12 animate-fade-in">
                <div className="text-center">
                    <div className="orbit-loader mx-auto mb-6">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">{t('contentGen.generating')}</h2>
                    <p className="text-sm text-text-muted">
                        {t(contentTypes.find(ct => ct.id === selectedType)?.labelKey)} · {topic}
                    </p>
                </div>
                <div className="progress-bar-indeterminate rounded-full" />
                <div className="flex items-center justify-center gap-2 text-text-muted">
                    <span className="text-xs">{t('contentGen.writing')}</span>
                    <span className="typing-cursor text-xs" />
                </div>
            </div>
        );
    }

    /* ==================== DETAIL VIEW (from history) ==================== */
    if (view === VIEW_DETAIL && selectedHistoryItem) {
        const item = selectedHistoryItem;
        const ct = contentTypes.find(c => c.id === item.contentType);
        const TypeIcon = ct?.icon || FileText;
        return (
            <div className="space-y-6">
                {/* Header + actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setSelectedHistoryItem(null); setView(VIEW_HISTORY); }}
                            className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center hover:bg-surface-secondary/80 transition-colors cursor-pointer">
                            <ArrowLeft className="w-4 h-4 text-text-muted" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-text-primary">{item.topic}</h1>
                            <p className="text-xs text-text-muted">
                                {ct ? t(ct.labelKey) : item.contentType} · {item.wordCount || 0} {t('contentGen.words')} · {item.companyName}
                                {item.createdAt && ` · ${new Date(item.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="secondary" size="sm" icon={copied ? Check : Copy}
                            onClick={() => copyContent(item.content)}>
                            {copied ? t('contentGen.copied') : t('contentGen.copy')}
                        </Button>
                        <Button variant="secondary" size="sm" icon={Download}
                            onClick={() => exportMarkdown(item)}>
                            .md
                        </Button>
                        <Button variant="secondary" size="sm" icon={Download}
                            onClick={() => exportHTML(item)}>
                            .html
                        </Button>
                        <Button variant="secondary" size="sm" icon={Trash2}
                            onClick={() => deleteItem(item.id)}>
                            {t('contentGen.delete')}
                        </Button>
                    </div>
                </div>

                {/* Metadata row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.type')}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <TypeIcon className="w-4 h-4 text-brand" />
                            <span className="text-sm font-semibold text-text-primary">{ct ? t(ct.labelKey) : item.contentType}</span>
                        </div>
                    </Card>
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.wordsLabel')}</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{item.wordCount || 0}</p>
                    </Card>
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.company')}</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{item.companyName || '—'}</p>
                    </Card>
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.industry')}</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{item.industry || '—'}</p>
                    </Card>
                </div>

                {/* Content */}
                <Card hover={false} padding="p-6 sm:p-8">
                    <div className="prose prose-sm max-w-none">
                        <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap"
                            style={{ fontFamily: 'system-ui' }}>
                            {item.content}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    /* ==================== RESULT VIEW ==================== */
    if (view === VIEW_RESULT && generatedContent) {
        const ct = contentTypes.find(c => c.id === selectedType);
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">{topic}</h1>
                        <p className="text-xs text-text-muted">
                            {ct ? t(ct.labelKey) : ''} · {generatedContent.split(/\s+/).length} {t('contentGen.words')} · {companyName} · {t('contentGen.saved')} ✓
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="secondary" size="sm" icon={copied ? Check : Copy}
                            onClick={() => copyContent()}>
                            {copied ? t('contentGen.copied') : t('contentGen.copy')}
                        </Button>
                        <Button variant="secondary" size="sm" icon={Download}
                            onClick={() => exportMarkdown()}>
                            {t('contentGen.exportMd')}
                        </Button>
                        <Button variant="secondary" size="sm" icon={Download}
                            onClick={() => exportHTML()}>
                            {t('contentGen.exportHtml')}
                        </Button>
                        <Button variant="secondary" size="sm" icon={RefreshCw}
                            onClick={() => { setView(VIEW_FORM); setGeneratedContent(''); }}>
                            {t('contentGen.new')}
                        </Button>
                    </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.type')}</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{ct ? t(ct.labelKey) : ''}</p>
                    </Card>
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.wordsLabel')}</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{generatedContent.split(/\s+/).length}</p>
                    </Card>
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.company')}</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{companyName || '—'}</p>
                    </Card>
                    <Card hover={false} padding="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{t('contentGen.industry')}</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{industry || '—'}</p>
                    </Card>
                </div>

                {/* Content */}
                <Card hover={false} padding="p-6 sm:p-8">
                    <div className="prose prose-sm max-w-none">
                        <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap"
                            style={{ fontFamily: 'system-ui' }}>
                            {generatedContent}
                        </div>
                    </div>
                </Card>

                {/* Bottom actions */}
                <div className="flex gap-3">
                    <Button variant="secondary" icon={Clock}
                        onClick={() => setView(VIEW_HISTORY)}>
                        {t('contentGen.viewHistory')} ({history.length})
                    </Button>
                    <Button icon={Plus}
                        onClick={() => { setView(VIEW_FORM); setGeneratedContent(''); }}>
                        {t('contentGen.generateAnother')}
                    </Button>
                </div>
            </div>
        );
    }

    /* ==================== HISTORY VIEW ==================== */
    if (view === VIEW_HISTORY) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView(VIEW_FORM)}
                            className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center hover:bg-surface-secondary/80 transition-colors cursor-pointer">
                            <ArrowLeft className="w-4 h-4 text-text-muted" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-text-primary">{t('contentGen.historyTitle')}</h1>
                            <p className="text-xs text-text-muted">{history.length} {t('contentGen.historySaved')}</p>
                        </div>
                    </div>
                    <Button size="sm" icon={Plus} onClick={() => setView(VIEW_FORM)}>{t('contentGen.new')}</Button>
                </div>

                {history.length === 0 ? (
                    <Card hover={false} padding="p-12" className="text-center">
                        <PenTool className="w-10 h-10 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">{t('contentGen.noContent')}</h3>
                        <p className="text-sm text-text-secondary mb-6">{t('contentGen.noContentDesc')}</p>
                        <Button icon={Sparkles} onClick={() => setView(VIEW_FORM)}>{t('contentGen.start')}</Button>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {history.map((item) => {
                            const ct = contentTypes.find(c => c.id === item.contentType);
                            const TypeIcon = ct?.icon || FileText;
                            return (
                                <Card key={item.id} padding="p-4" className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => { setSelectedHistoryItem(item); setView(VIEW_DETAIL); }}>
                                    <div className="flex items-center gap-4">
                                        <TypeIcon className="w-4 h-4 text-brand shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-text-primary truncate">{item.topic}</h3>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-[10px] font-medium text-brand bg-brand-50 px-1.5 py-0.5 rounded">{ct ? t(ct.labelKey) : item.contentType}</span>
                                                <span className="text-[10px] text-text-muted">{item.wordCount || 0} {t('contentGen.words')}</span>
                                                <span className="text-[10px] text-text-muted">·</span>
                                                <span className="text-[10px] text-text-muted">{item.companyName}</span>
                                                {item.createdAt && (
                                                    <>
                                                        <span className="text-[10px] text-text-muted">·</span>
                                                        <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {new Date(item.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); copyContent(item.content); }}
                                                className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                                                title={t('contentGen.copy')}>
                                                <Copy className="w-3.5 h-3.5 text-text-muted" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); exportMarkdown(item); }}
                                                className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                                                title={t('contentGen.exportMd')}>
                                                <Download className="w-3.5 h-3.5 text-text-muted" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                                title={t('contentGen.delete')}>
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                            <ChevronRight className="w-4 h-4 text-text-muted ml-1" />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    /* ==================== FORM VIEW ==================== */
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t('contentGen.title')}</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        {t('contentGen.subtitle')}
                    </p>
                </div>
                {history.length > 0 && (
                    <Button variant="secondary" size="sm" icon={Clock}
                        onClick={() => setView(VIEW_HISTORY)}>
                        {t('contentGen.history')} ({history.length})
                    </Button>
                )}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left — Controls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content type selector */}
                    <Card hover={false} padding="p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">{t('contentGen.contentType')}</h3>
                        <div className="space-y-2">
                            {contentTypes.map((ct) => (
                                <button key={ct.id} onClick={() => setSelectedType(ct.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${selectedType === ct.id
                                        ? 'bg-brand-50 border border-brand-200 shadow-sm'
                                        : 'bg-surface-secondary hover:bg-surface-secondary/80 border border-transparent'
                                        }`}>
                                    <ct.icon className={`w-5 h-5 shrink-0 ${selectedType === ct.id ? 'text-brand' : 'text-text-muted'}`} />
                                    <div>
                                        <p className={`text-sm font-medium ${selectedType === ct.id ? 'text-brand' : 'text-text-primary'}`}>{t(ct.labelKey)}</p>
                                        <p className="text-[10px] text-text-muted">{t(ct.descKey)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Topic & context */}
                    <Card hover={false} padding="p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">{t('contentGen.contentDetails')}</h3>
                        <div className="space-y-3">
                            <Input label={t('contentGen.topicLabel')} placeholder="e.g. softbox vs umbrella for portrait lighting"
                                value={topic} onChange={(e) => setTopic(e.target.value)} required />
                            <Input label={t('contentGen.companyName')} placeholder="Your brand"
                                value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            <Input label={t('contentGen.industryLabel')} placeholder="Photography, SaaS, etc."
                                value={industry} onChange={(e) => setIndustry(e.target.value)} />
                        </div>
                    </Card>

                    <Button size="lg" icon={Sparkles} onClick={generateContent}
                        disabled={!topic.trim()}
                        className="w-full shadow-[0_4px_16px_rgba(249,115,22,0.3)]">
                        {t('contentGen.generate')}
                    </Button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                    )}
                </div>

                {/* Right — Preview / recent */}
                <div className="lg:col-span-3 space-y-4">
                    <Card hover={false} padding="p-12" className="text-center min-h-[400px] flex items-center justify-center">
                        <div>
                            <PenTool className="w-8 h-8 text-brand mx-auto mb-5" />
                            <h3 className="text-xl font-semibold text-text-primary mb-2">
                                {t('contentGen.previewTitle')}
                            </h3>
                            <p className="text-base text-text-secondary max-w-sm mx-auto leading-relaxed mb-4">
                                {t('contentGen.previewDesc')}
                            </p>
                            <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
                                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-600" /> {t('contentGen.saved')}</span>
                                <span className="flex items-center gap-1"><Download className="w-3 h-3 text-text-muted" /> {t('contentGen.exportTag')}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-text-muted" /> {t('contentGen.history')}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Recent history preview */}
                    {history.length > 0 && (
                        <Card hover={false} padding="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-text-primary">{t('contentGen.recent')}</h3>
                                <button onClick={() => setView(VIEW_HISTORY)}
                                    className="text-xs text-brand font-medium cursor-pointer hover:underline">
                                    {t('contentGen.viewAll')} ({history.length})
                                </button>
                            </div>
                            <div className="space-y-2">
                                {history.slice(0, 5).map((item) => {
                                    const ct = contentTypes.find(c => c.id === item.contentType);
                                    const TypeIcon = ct?.icon || FileText;
                                    return (
                                        <button key={item.id}
                                            onClick={() => { setSelectedHistoryItem(item); setView(VIEW_DETAIL); }}
                                            className="w-full flex items-center gap-3 p-3 bg-surface-secondary rounded-xl text-left hover:bg-surface-secondary/80 transition-colors cursor-pointer">
                                            <TypeIcon className="w-4 h-4 text-text-muted shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-text-primary truncate">{item.topic}</p>
                                                <p className="text-[10px] text-text-muted">
                                                    {ct ? t(ct.labelKey) : ''} · {item.wordCount || 0} {t('contentGen.words')}
                                                    {item.createdAt && ` · ${new Date(item.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}`}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
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
