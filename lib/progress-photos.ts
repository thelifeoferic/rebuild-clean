export type ProgressPhotoAnalysis = {
  disclaimer: string;
  nextActions: string[];
  observations: string[];
  progressPhotoTips: string[];
  summary: string;
  trainingPriorities: string[];
};

export type ProgressPhoto = {
  analysis?: ProgressPhotoAnalysis;
  analysisMock?: boolean;
  id: string;
  analysisSummary?: string;
  createdAt: string;
  imageData: string;
  note?: string;
};

const dbName = "rebuild-progress-photos";
const storeName = "photos";
const dbVersion = 1;

export async function listProgressPhotos() {
  const db = await openProgressPhotoDb();

  return new Promise<ProgressPhoto[]>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();

    request.onsuccess = () => {
      const photos = (request.result as ProgressPhoto[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveProgressPhoto(photo: ProgressPhoto) {
  const db = await openProgressPhotoDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(photo);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProgressPhoto(id: string) {
  const db = await openProgressPhotoDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function openProgressPhotoDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Progress photos are not supported in this browser."));
      return;
    }

    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
