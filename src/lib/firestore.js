// Firestore helper functions
import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== USERS ====================
export async function getUserProfile(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function updateUserProfile(uid, data) {
    const docRef = doc(db, 'users', uid);
    return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

// ==================== WEBSITES ====================
export async function addWebsite(uid, websiteData) {
    return addDoc(collection(db, 'websites'), {
        userId: uid,
        ...websiteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function getUserWebsites(uid) {
    const q = query(
        collection(db, 'websites'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==================== AUDITS ====================
export async function createAudit(uid, auditData) {
    return addDoc(collection(db, 'audits'), {
        userId: uid,
        ...auditData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function getUserAudits(uid) {
    const q = query(
        collection(db, 'audits'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAudit(auditId) {
    const docRef = doc(db, 'audits', auditId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function updateAudit(auditId, data) {
    const docRef = doc(db, 'audits', auditId);
    return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

// ==================== RECOMMENDATIONS ====================
export async function addRecommendation(auditId, recData) {
    return addDoc(collection(db, 'recommendations'), {
        auditId,
        ...recData,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
}

export async function getAuditRecommendations(auditId) {
    const q = query(
        collection(db, 'recommendations'),
        where('auditId', '==', auditId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==================== REPORTS ====================
export async function createReport(uid, auditId, reportData) {
    return addDoc(collection(db, 'reports'), {
        userId: uid,
        auditId,
        ...reportData,
        createdAt: serverTimestamp(),
    });
}

export async function getUserReports(uid) {
    const q = query(
        collection(db, 'reports'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==================== SCANS ====================
export async function createScan(uid, websiteId, scanData) {
    return addDoc(collection(db, 'scans'), {
        userId: uid,
        websiteId,
        ...scanData,
        status: 'running',
        createdAt: serverTimestamp(),
    });
}

export async function getRecentScans(uid, count = 5) {
    const q = query(
        collection(db, 'scans'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==================== COMPETITORS ====================
export async function addCompetitor(uid, competitorData) {
    return addDoc(collection(db, 'competitors'), {
        userId: uid,
        ...competitorData,
        createdAt: serverTimestamp(),
    });
}

export async function getUserCompetitors(uid) {
    const q = query(
        collection(db, 'competitors'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==================== PROMPTS (tracked AI questions) ====================
export async function addTrackedPrompt(uid, promptData) {
    return addDoc(collection(db, 'prompts'), {
        userId: uid,
        ...promptData,
        createdAt: serverTimestamp(),
    });
}

export async function getUserPrompts(uid) {
    const q = query(
        collection(db, 'prompts'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
