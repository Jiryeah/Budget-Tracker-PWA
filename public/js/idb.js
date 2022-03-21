let db;

const request = indexedDB.open('budget-tracker-pwa', 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore('transact', { autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (e) => {
  console.log(e.target.errorCode);
};

const saveMemory = (memory) => {
  const transaction = db.transaction(['transact'], 'readwrite');
  const store = transaction.objectStore('transact');

  store.add(memory);
};

const checkDatabase = () => {
  const transaction = db.transaction(['transact'], 'readwrite');
  const store = transaction.objectStore('transact');
  const All = store.getAll();

  All.onsuccess = () => {
    if (All.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'Post',
        body: JSON.stringify(All.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json)
        .then(() => {
          const transaction = db.transaction('transact', 'readwrite');
          const store = transaction.objectStore('transact');

          store.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
};

const stagnantDelete = () => {
  const transaction = db.transaction(['transact'], 'readwrite');
  const store = transaction.objectStore('transact');

  store.clear();
};

window.addEventListener('online', checkDatabase);
