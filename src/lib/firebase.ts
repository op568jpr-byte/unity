import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDoc,
  getDocs
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

export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const firebaseEnabled = true;

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
    const isQuota = error?.message?.includes('Quota exceeded') || 
      error?.code?.includes('resource-exhausted') || 
      String(error).includes('Quota exceeded') ||
      String(error).includes('quota');

    if (isQuota) {
      console.warn(`Firestore quota reached while saving to ${collectionName}. Work cached locally.`, error.message || error);
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { detail: { collection: collectionName } }));
    } else {
      console.error(`Error saving document to ${collectionName}:`, error);
    }
    throw error;
  }
}

// Delete a single document from Firestore
export async function deleteDocument(collectionName: string, id: string | number) {
  try {
    const docRef = doc(db, collectionName, id.toString());
    await deleteDoc(docRef);
  } catch (error: any) {
    const isQuota = error?.message?.includes('Quota exceeded') || 
      error?.code?.includes('resource-exhausted') || 
      String(error).includes('Quota exceeded') ||
      String(error).includes('quota');

    if (isQuota) {
      console.warn(`Firestore quota reached while deleting from ${collectionName}. Work cached locally.`, error.message || error);
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { detail: { collection: collectionName } }));
    } else {
      console.error(`Error deleting document from ${collectionName}:`, error);
    }
    throw error;
  }
}

// Fetch all documents of a collection directly from Firestore
export async function fetchCollectionDocuments<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const list: T[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as T);
    });
    return list;
  } catch (error: any) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}

// Batch save multiple documents to Firestore
export async function batchSaveDocuments(collectionName: string, items: any[]): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    // Firestore batch limit is 500 operations
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
    console.error(`Error in batchSaveDocuments for ${collectionName}:`, error);
    throw error;
  }
}

// Set up real-time listener for a collection, and seed it if it's empty
export function setupCollectionSync<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  initialDataFallback: T[]
) {

  const colRef = collection(db, collectionName);
  
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialDataFallback && initialDataFallback.length > 0) {
      try {
        const seedRef = doc(db, 'system_metadata', 'seeding');
        const seedSnap = await getDoc(seedRef);
        const seededData = seedSnap.exists() ? seedSnap.data() : {};
        if (seededData[collectionName]) {
          // Already seeded before, do not re-seed when empty!
          onUpdate([]);
          return;
        }

        console.log(`Seeding initial data for ${collectionName}...`);
        const batch = writeBatch(db);
        initialDataFallback.forEach((item: any) => {
          const id = item.id;
          if (id) {
            const docRef = doc(colRef, id.toString());
            batch.set(docRef, sanitizeForFirestore(item));
          }
        });
        await batch.commit();

        // Mark as seeded in Firestore
        await setDoc(seedRef, { ...seededData, [collectionName]: true }, { merge: true });
      } catch (e: any) {
        const isQuota = e?.message?.includes('Quota exceeded') || 
          e?.code?.includes('resource-exhausted') || 
          String(e).includes('Quota exceeded') ||
          String(e).includes('quota');

        if (isQuota) {
          console.warn(`Firestore quota reached while checking seeding status for ${collectionName}. Using fallback:`, e.message || e);
          window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { detail: { collection: collectionName } }));
        } else {
          console.error(`Error checking seeding status for ${collectionName}:`, e);
        }
        onUpdate([]);
      }
    } else {
      const list: T[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as T);
      });
      onUpdate(list);
    }
  }, (error: any) => {
    const isQuota = error?.message?.includes('Quota exceeded') || 
      error?.code?.includes('resource-exhausted') || 
      String(error).includes('Quota exceeded') ||
      String(error).includes('quota');

    if (isQuota) {
      console.warn(`Firestore quota reached for syncing ${collectionName}. Using cached device data:`, error.message || error);
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { detail: { collection: collectionName } }));
    } else {
      console.error(`Error syncing collection ${collectionName}:`, error);
    }
  });
}

// Set up real-time listener for settings, and seed it if it's empty
export function setupSettingsSync(
  onUpdate: (settings: any) => void,
  fallbackSettings: any
) {
  const docRef = doc(db, 'settings', 'hostel_settings');
  
  return onSnapshot(docRef, async (snapshot) => {
    if (!snapshot.exists()) {
      console.log('Seeding initial hostel settings...');
      await setDoc(docRef, sanitizeForFirestore(fallbackSettings));
    } else {
      onUpdate({ ...fallbackSettings, ...snapshot.data() });
    }
  }, (error: any) => {
    const isQuota = error?.message?.includes('Quota exceeded') || 
      error?.code?.includes('resource-exhausted') || 
      String(error).includes('Quota exceeded') ||
      String(error).includes('quota');

    if (isQuota) {
      console.warn('Firestore quota reached for syncing settings. Using cached device data:', error.message || error);
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { detail: { collection: 'settings' } }));
    } else {
      console.error('Error syncing settings:', error);
    }
  });
}
