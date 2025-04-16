export class TodoItem {
  constructor(text, priority = 'medium') {
    this.id = Date.now().toString();
    this.text = text;
    this.done = false;
    this.archived = false;
    this.priority = priority;
    this.createdAt = new Date();
  }

  toggleDone() {
    this.done = !this.done;
  }

  toggleArchived() {
    this.archived = !this.archived;
  }

  updateText(newText) {
    this.text = newText;
  }
}

export class TodoList {
  constructor() {
    this.items = new Map();
  }

  addItem(text, priority) {
    const item = new TodoItem(text, priority);
    this.items.set(item.id, item);
    return item;
  }

  removeItem(id) {
    return this.items.delete(id);
  }

  getAllItems() {
    return Array.from(this.items.values());
  }

  getFilteredItems(filter) {
    const items = this.getAllItems();
    switch (filter) {
      case 'all':
        return items.filter(item => !item.archived);
      case 'done':
        return items.filter(item => item.done && !item.archived);
      case 'archived':
        return items.filter(item => item.archived);
      default:
        return items;
    }
  }

  getSortedItems(filter = 'all') {
    return this.getFilteredItems(filter).sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}