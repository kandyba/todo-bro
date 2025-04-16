const STORAGE_KEY = 'todo-items';

export const storage = {
  save(items, userEmail) {
    const key = `${STORAGE_KEY}-${userEmail}`;
    const data = Array.from(items.entries());
    localStorage.setItem(key, JSON.stringify(data));
  },

  load(userEmail) {
    const key = `${STORAGE_KEY}-${userEmail}`;
    const data = localStorage.getItem(key);
    if (!data) return new Map();

    const items = new Map();
    JSON.parse(data).forEach(([id, item]) => {
      item.createdAt = new Date(item.createdAt);
      items.set(id, item);
    });
    return items;
  }
};