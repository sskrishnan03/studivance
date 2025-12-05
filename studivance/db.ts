
const DB_NAME = 'StudivanceDB';
const DB_VERSION = 2; // Incremented version to force upgrade
const STORES = ['subjects', 'tasks', 'exams', 'notes', 'goals', 'events', 'chats'];

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      STORES.forEach(storeName => {
        if (!dbInstance.objectStoreNames.contains(storeName)) {
            dbInstance.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
        return reject("DB not initialized");
    }
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      console.error(`Error getting all from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

export const add = <T extends { id: string }>(storeName: string, item: T): Promise<IDBValidKey> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB not initialized");
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error(`Error adding to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
};

export const put = <T extends { id: string }>(storeName: string, item: T): Promise<IDBValidKey> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB not initialized");
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error(`Error putting in ${storeName}:`, request.error);
        reject(request.error);
      };
    });
};

export const remove = (storeName: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB not initialized");
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
  
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error(`Error deleting from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
};

export const clearStore = (storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error(`Error clearing ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};