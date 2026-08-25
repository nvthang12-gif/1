// Audio recording, custom sound uploads and IndexedDB / LocalStorage persistence

const DB_NAME = 'BeVuiHocAudioDB';
const STORE_NAME = 'custom_recordings';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface CustomAudioRecord {
  id: string; // e.g. 'letter_A', 'animal_dog', 'action_watering-flowers'
  title: string;
  audioBlob?: Blob;
  audioUrl?: string; // base64 or blob URL
  timestamp: number;
}

// In-memory cache for fast lookup
const audioCache: Map<string, string> = new Map();

export async function saveCustomAudio(id: string, title: string, blob: Blob): Promise<string> {
  // Convert blob to base64 for persistent storage
  const base64 = await blobToBase64(blob);
  audioCache.set(id, base64);

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      id,
      title,
      audioUrl: base64,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Could not save to IndexedDB, fallback to memory cache:', err);
    try {
      localStorage.setItem(`custom_audio_${id}`, base64);
    } catch {
      // ignore
    }
  }

  return base64;
}

export async function getCustomAudio(id: string): Promise<string | null> {
  if (audioCache.has(id)) {
    return audioCache.get(id)!;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.audioUrl) {
          audioCache.set(id, req.result.audioUrl);
          resolve(req.result.audioUrl);
        } else {
          // Check local storage fallback
          const local = localStorage.getItem(`custom_audio_${id}`);
          if (local) {
            audioCache.set(id, local);
            resolve(local);
          } else {
            resolve(null);
          }
        }
      };
      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    const local = localStorage.getItem(`custom_audio_${id}`);
    if (local) {
      audioCache.set(id, local);
      return local;
    }
    return null;
  }
}

export async function deleteCustomAudio(id: string): Promise<void> {
  audioCache.delete(id);
  try {
    localStorage.removeItem(`custom_audio_${id}`);
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch (err) {
    console.warn('Error deleting custom audio:', err);
  }
}

export interface CustomAudioEntry {
  itemId: string;
  title: string;
  dataUrl: string;
  timestamp: number;
}

export async function getAllCustomAudioList(): Promise<CustomAudioEntry[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []).map((item: { id: string; title: string; audioUrl: string; timestamp: number }) => ({
          itemId: item.id,
          title: item.title || item.id,
          dataUrl: item.audioUrl,
          timestamp: item.timestamp,
        }));
        resolve(list);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}


function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
