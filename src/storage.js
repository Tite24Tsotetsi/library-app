export const K_BOOKS = "Titus_books";
export const K_USERS = "Titus_users";
export const K_TXNS = "Titus_transactions";
export const K_SESSION = "Titus_session";
export const LOW_STOCK = 2;

export const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const genId = (p) => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const byTitle = (a, b) => a.title.localeCompare(b.title);

export function seedIfEmpty() {
  if (load(K_USERS, null) === null) {
    save(K_USERS, [
      { id: genId("usr"), name: "Head Librarian", membershipId: "Tsotetsi", password: "Tite@2025", role: "admin" },
    ]);
  }
  if (load(K_TXNS, null) === null) save(K_TXNS, []);
}
