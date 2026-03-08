/**
 * Firestore storage for Content Opportunity Engine results
 */

import {
    collection, doc, addDoc, getDocs, query, where, orderBy,
    writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Save all content opportunity engine results to Firestore
 */
export async function saveContentOpportunities(uid, auditId, opportunityResult) {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    // 1. Save content opportunities
    for (const opp of (opportunityResult.contentOpportunities || []).slice(0, 30)) {
        const ref = doc(collection(db, 'content_opportunities'));
        batch.set(ref, {
            userId: uid,
            auditId,
            title: opp.title,
            type: opp.type,
            priority: opp.priority,
            reason: opp.reason,
            aiValue: opp.aiValue,
            gapDetected: opp.gapDetected,
            suggestedStructure: opp.suggestedStructure || [],
            createdAt: now,
        });
    }

    // 2. Save FAQ opportunities
    for (const faq of (opportunityResult.faqOpportunities || []).slice(0, 30)) {
        const ref = doc(collection(db, 'faq_opportunities'));
        batch.set(ref, {
            userId: uid,
            auditId,
            question: faq.question,
            reason: faq.reason,
            priority: faq.priority,
            createdAt: now,
        });
    }

    // 3. Save comparison opportunities
    for (const comp of (opportunityResult.comparisonOpportunities || []).slice(0, 20)) {
        const ref = doc(collection(db, 'comparison_opportunities'));
        batch.set(ref, {
            userId: uid,
            auditId,
            title: comp.title,
            reason: comp.reason,
            priority: comp.priority,
            createdAt: now,
        });
    }

    // 4. Save definition opportunities
    for (const def of (opportunityResult.definitionOpportunities || []).slice(0, 20)) {
        const ref = doc(collection(db, 'definition_opportunities'));
        batch.set(ref, {
            userId: uid,
            auditId,
            title: def.title,
            reason: def.reason,
            priority: def.priority,
            createdAt: now,
        });
    }

    // 5. Save content themes
    for (const theme of (opportunityResult.contentThemes || []).slice(0, 15)) {
        const ref = doc(collection(db, 'content_themes'));
        batch.set(ref, {
            userId: uid,
            auditId,
            label: theme.label,
            frequency: theme.frequency || 0,
            priority: theme.priority,
            createdAt: now,
        });
    }

    // 6. Save priority plan
    for (const action of (opportunityResult.priorityPlan || []).slice(0, 10)) {
        const ref = doc(collection(db, 'priority_plans'));
        batch.set(ref, {
            userId: uid,
            auditId,
            action,
            createdAt: now,
        });
    }

    await batch.commit();

    return {
        saved: true,
        stats: opportunityResult.stats,
    };
}

/**
 * Retrieve content opportunities for an audit
 */
export async function getContentOpportunities(auditId) {
    const q = query(collection(db, 'content_opportunities'), where('auditId', '==', auditId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFaqOpportunities(auditId) {
    const q = query(collection(db, 'faq_opportunities'), where('auditId', '==', auditId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getComparisonOpportunities(auditId) {
    const q = query(collection(db, 'comparison_opportunities'), where('auditId', '==', auditId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDefinitionOpportunities(auditId) {
    const q = query(collection(db, 'definition_opportunities'), where('auditId', '==', auditId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getContentThemes(auditId) {
    const q = query(collection(db, 'content_themes'), where('auditId', '==', auditId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPriorityPlan(auditId) {
    const q = query(collection(db, 'priority_plans'), where('auditId', '==', auditId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
