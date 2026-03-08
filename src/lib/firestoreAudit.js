/**
 * Firestore Audit Storage — save and retrieve complete audit results
 */

import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

/* ==================== PROJECTS ==================== */

export async function createProject(uid, projectData) {
    const ref = await addDoc(collection(db, 'projects'), {
        userId: uid,
        companyName: projectData.companyName || '',
        websiteUrl: projectData.websiteUrl || '',
        industry: projectData.industry || '',
        country: projectData.country || '',
        competitors: projectData.competitors || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

export async function getUserProjects(uid) {
    const q = query(
        collection(db, 'projects'),
        where('userId', '==', uid),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
            const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return tb - ta;
        });
}

export async function getProject(projectId) {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

/* ==================== FULL AUDIT SAVE ==================== */

/**
 * Save a complete audit result to Firestore
 * Creates documents in: audits, faq_suggestions, suggested_pages, competitors, crawled_pages
 */
export async function saveFullAudit(uid, auditResult) {
    const batch = writeBatch(db);

    // 1. Create or update the project
    let projectId = auditResult.projectId;
    if (!projectId) {
        const projectRef = await addDoc(collection(db, 'projects'), {
            userId: uid,
            companyName: auditResult.companyName || '',
            websiteUrl: auditResult.website || '',
            industry: auditResult.industry || '',
            country: auditResult.country || '',
            competitors: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        projectId = projectRef.id;
    }

    // 2. Save the main audit document
    const auditRef = doc(collection(db, 'audits'));
    const auditId = auditRef.id;

    batch.set(auditRef, {
        userId: uid,
        projectId,
        auditId: auditResult.auditId || auditId,
        companyName: auditResult.companyName || '',
        website: auditResult.website || '',
        industry: auditResult.industry || '',
        country: auditResult.country || '',
        visibilityScore: auditResult.visibilityScore || 0,
        subScores: auditResult.subScores || {},
        scoreExplanation: auditResult.scoreExplanation || '',
        summary: auditResult.summary || '',
        executiveReport: auditResult.executiveReport || '',
        strengths: auditResult.strengths || [],
        weaknesses: auditResult.weaknesses || [],
        opportunities: auditResult.opportunities || [],
        priorityActions: auditResult.priorityActions || [],
        recommendations: auditResult.recommendations || [],
        pagesCrawled: auditResult.crawl?.pagesCrawled || 0,
        pageTypes: auditResult.crawl?.pageTypes || {},
        siteSignals: auditResult.crawl?.siteSignals || {},
        contentGaps: auditResult.crawl?.contentGaps || [],
        duration: auditResult.duration || 0,
        provider: auditResult.provider || 'demo',
        status: 'completed',
        createdAt: serverTimestamp(),
    });

    // Commit the main audit
    await batch.commit();

    // 3. Save sub-collections (use separate batches to avoid 500-write limit)

    // FAQ Suggestions
    const faqBatch = writeBatch(db);
    for (const question of (auditResult.faqSuggestions || []).slice(0, 20)) {
        const ref = doc(collection(db, 'faq_suggestions'));
        faqBatch.set(ref, {
            auditId,
            projectId,
            userId: uid,
            question,
            status: 'suggested',
            createdAt: serverTimestamp(),
        });
    }
    await faqBatch.commit();

    // Suggested Pages
    const pagesBatch = writeBatch(db);
    for (const page of (auditResult.suggestedPages || []).slice(0, 20)) {
        const ref = doc(collection(db, 'suggested_pages'));
        pagesBatch.set(ref, {
            auditId,
            projectId,
            userId: uid,
            title: page.title || '',
            type: page.type || 'guide',
            reason: page.reason || '',
            priority: page.priority || 'medium',
            status: 'suggested',
            createdAt: serverTimestamp(),
        });
    }
    await pagesBatch.commit();

    // Competitor Analysis
    const compBatch = writeBatch(db);
    for (const comp of (auditResult.competitorAnalysis || []).slice(0, 10)) {
        const ref = doc(collection(db, 'competitor_analysis'));
        compBatch.set(ref, {
            auditId,
            projectId,
            userId: uid,
            domain: comp.competitor || '',
            advantage: comp.advantage || '',
            gap: comp.gap || '',
            createdAt: serverTimestamp(),
        });
    }
    await compBatch.commit();

    // Executive Report
    if (auditResult.report) {
        await addDoc(collection(db, 'reports'), {
            auditId,
            projectId,
            userId: uid,
            report: auditResult.report.report || '',
            biggestIssue: auditResult.report.biggestIssue || '',
            bestOpportunity: auditResult.report.bestOpportunity || '',
            recommendedNextSteps: auditResult.report.recommendedNextSteps || [],
            createdAt: serverTimestamp(),
        });
    }

    // Crawled Pages (save top 30 to avoid heavy writes)
    const crawlBatch = writeBatch(db);
    for (const page of (auditResult.crawl?.pages || []).slice(0, 30)) {
        const ref = doc(collection(db, 'crawled_pages'));
        crawlBatch.set(ref, {
            auditId,
            projectId,
            userId: uid,
            url: page.url || '',
            title: page.title || '',
            metaDescription: page.metaDescription || '',
            h1: page.h1 || '',
            h2s: (page.h2s || []).slice(0, 10),
            wordCount: page.wordCount || 0,
            pageType: page.pageType || 'other',
            pageScore: page.pageScore || 0,
            hasFAQ: page.hasFAQ || false,
            hasTable: page.hasTable || false,
            hasList: page.hasList || false,
            hasAnswerFirst: page.hasAnswerFirst || false,
            schemaTypes: page.schemaTypes || [],
            statusCode: page.statusCode || 0,
            createdAt: serverTimestamp(),
        });
    }
    await crawlBatch.commit();

    return { auditId, projectId };
}

/* ==================== AUDIT RETRIEVAL ==================== */

export async function getUserAuditsFromStore(uid, count = 20) {
    const q = query(
        collection(db, 'audits'),
        where('userId', '==', uid),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map((d) => {
            const data = d.data();
            // Normalize createdAt for display
            let createdAt = data.createdAt;
            if (createdAt?.toDate) createdAt = createdAt.toDate().toISOString();
            return { id: d.id, ...data, createdAt };
        })
        .sort((a, b) => {
            const ta = new Date(a.createdAt || 0);
            const tb = new Date(b.createdAt || 0);
            return tb - ta;
        })
        .slice(0, count);
}

export async function getAuditById(auditId) {
    const q = query(
        collection(db, 'audits'),
        where('auditId', '==', auditId),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}

export async function getAuditFaqs(auditId) {
    const q = query(
        collection(db, 'faq_suggestions'),
        where('auditId', '==', auditId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAuditSuggestedPages(auditId) {
    const q = query(
        collection(db, 'suggested_pages'),
        where('auditId', '==', auditId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAuditCrawledPages(auditId) {
    const q = query(
        collection(db, 'crawled_pages'),
        where('auditId', '==', auditId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.pageScore || 0) - (a.pageScore || 0));
}

export async function getAuditCompetitors(auditId) {
    const q = query(
        collection(db, 'competitor_analysis'),
        where('auditId', '==', auditId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAuditReport(auditId) {
    const q = query(
        collection(db, 'reports'),
        where('auditId', '==', auditId),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}
