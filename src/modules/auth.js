export class Auth {
  constructor() {
    this.users = new Map(JSON.parse(localStorage.getItem('users') || '[]'));
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  signUp(email, password) {
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const user = {
      email,
      password,
      createdAt: new Date()
    };

    this.users.set(email, user);
    localStorage.setItem('users', JSON.stringify(Array.from(this.users.entries())));
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  signIn(email, password) {
    const user = this.users.get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  hasUsers() {
    return this.users.size > 0;
  }
}