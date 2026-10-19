// Safe storage helper for high-resolution images & media assets
// Avoids localStorage 5MB quota errors by utilizing IndexedDB with fallback

const DB_NAME = 'rocknet_media_store_v1';
const STORE_NAME = 'media_assets';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaAsset(key: string, data: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save media asset to IndexedDB:', err);
  }
}

export async function getMediaAsset(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Could not retrieve media asset from IndexedDB:', err);
    return null;
  }
}

export async function removeMediaAsset(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

// Safe localStorage wrapper that guarantees no uncaught QuotaExceededError
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    // If saving a large data URL to localStorage, skip or trim to prevent QuotaExceededError
    if (value.startsWith('data:') && value.length > 50000) {
      console.warn(`Skipping localStorage.setItem for "${key}" because value is too large (${value.length} chars). Use IndexedDB or server upload instead.`);
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`safeLocalStorageSet failed for "${key}":`, err);
    return false;
  }
}

export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
