import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDoc,
  getDocs,
  disableNetwork,
  enableNetwork
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
});

// Initialize with persistent multi-tab cache for maximum resilience
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, config.firestoreDatabaseId || undefined);
  } catch (e) {
    return config.firestoreDatabaseId 
      ? getFirestore(app, config.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

export const firebaseEnabled = true;

// Quota and Resilience State Management
let quotaExceededState = false;
let networkDisabledState = false;

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  const errStr = String(error?.message || error?.code || error || '').toLowerCase();
  return (
    error?.code === 'resource-exhausted' ||
    errStr.includes('resource-exhausted') ||
    errStr.includes('quota limit exceeded') ||
    errStr.includes('quota exceeded') ||
    errStr.includes('quota metric') ||
    errStr.includes('free daily write units') ||
    errStr.includes('free daily read units') ||
    errStr.includes('429')
  );
}

export function checkIsQuotaExceeded(): boolean {
  return quotaExceededState;
}

export const isQuotaExceeded = checkIsQuotaExceeded;

export function markQuotaExceeded(context?: string) {
  quotaExceededState = true;
  console.warn(`[Unity Boys Hostel] Firestore daily quota notice (${context || 'operations'}). Local storage active.`);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { detail: { context } }));
  }
}

export async function tryReenableNetwork(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ubh_firestore_quota_exceeded');
    }
    quotaExceededState = false;
    networkDisabledState = false;
    await enableNetwork(db);
    return true;
  } catch (e) {
    return false;
  }
}

// Storage fallback keys mapping for collections
const collectionStorageKeys: Record<string, string> = {
  students: 'ubh_students',
  payments: 'ubh_payments',
  complaints: 'ubh_complaints',
  visitors: 'ubh_visitors',
  partnerWithdrawals: 'ubh_partner_withdrawals',
  expenses: 'ubh_hostel_expenses',
  settings: 'ubh_settings'
};

// Helper to sanitize data for Firestore (remove undefined and replace with empty string or null)
export function sanitizeForFirestore(data: any): any {
  if (data === undefined) {
    return '';
  }
  if (data === null) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      } else {
        cleaned[key] = '';
      }
    }
    return cleaned;
  }
  return data;
}

// Save or Update a single document in Firestore
export async function saveDocument(collectionName: string, id: string | number, data: any) {
  try {
    const sanitized = sanitizeForFirestore(data);
    const docRef = doc(db, collectionName, id.toString());
    await setDoc(docRef, sanitized);
  } catch (error: any) {
    if (isQuotaError(error)) {
      markQuotaExceeded(`save:${collectionName}`);
      return;
    }
    console.error(`Error saving document to ${collectionName}:`, error);
    throw error;
  }
}

// Delete a single document from Firestore
export async function deleteDocument(collectionName: string, id: string | number) {
  try {
    const docRef = doc(db, collectionName, id.toString());
    await deleteDoc(docRef);
  } catch (error: any) {
    if (isQuotaError(error)) {
      markQuotaExceeded(`delete:${collectionName}`);
      return;
    }
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// Fetch all documents of a collection directly from Firestore
export async function fetchCollectionDocuments<T>(collectionName: string): Promise<T[]> {
  const getLocalFallback = (): T[] => {
    const fallbackKey = collectionStorageKeys[collectionName];
    if (fallbackKey && typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(fallbackKey);
        if (item) {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  };

  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const list: T[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as T);
    });
    return list;
  } catch (error: any) {
    if (isQuotaError(error)) {
      markQuotaExceeded(`fetch:${collectionName}`);
      return getLocalFallback();
    }
    console.warn(`Unable to fetch collection ${collectionName} from cloud. Using local storage.`);
    return getLocalFallback();
  }
}

// Batch save multiple documents to Firestore
export async function batchSaveDocuments(collectionName: string, items: any[]): Promise<void> {
  if (!items || items.length === 0 || isQuotaExceeded()) return;
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        if (item && item.id !== undefined) {
          const docRef = doc(db, collectionName, item.id.toString());
          batch.set(docRef, sanitizeForFirestore(item));
        }
      }
      await batch.commit();
    }
  } catch (error: any) {
    if (isQuotaError(error)) {
      markQuotaExceeded(`batchSave:${collectionName}`);
      return;
    }
    console.warn(`Batch save skipped for ${collectionName}:`, error?.message || error);
  }
}

// Set up real-time listener for a collection
export function setupCollectionSync<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  initialDataFallback: T[]
) {
  const colRef = collection(db, collectionName);
  
  try {
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const list: T[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as T);
        });
        onUpdate(list);
      }
    }, (error: any) => {
      if (isQuotaError(error)) {
        markQuotaExceeded(`sync:${collectionName}`);
        return;
      }
      console.warn(`Sync warning for ${collectionName}:`, error?.message || error);
    });
  } catch (err: any) {
    if (isQuotaError(err)) {
      markQuotaExceeded(`listener:${collectionName}`);
    }
    return () => {};
  }
}

// Set up real-time listener for settings
export function setupSettingsSync(
  onUpdate: (settings: any) => void,
  fallbackSettings: any
) {
  const docRef = doc(db, 'settings', 'hostel_settings');
  
  try {
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ ...fallbackSettings, ...snapshot.data() });
      } else {
        onUpdate(fallbackSettings);
      }
    }, (error: any) => {
      if (isQuotaError(error)) {
        markQuotaExceeded('sync:settings');
        return;
      }
      console.warn('Settings sync warning:', error?.message || error);
    });
  } catch (err: any) {
    if (isQuotaError(err)) {
      markQuotaExceeded('listener:settings');
    }
    return () => {};
  }
}

