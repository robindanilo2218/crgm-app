/**
 * CORE: Authentication System
 */

import DatabaseManager from './database.js';

const AuthManager = {
  name: 'core.auth',
  version: '1.0.0',
  dependencies: ['core.database'],

  state: {
    initialized: false,
    currentUser: null,
    tokenRey: null
  },

  async init() {
    console.log('[AUTH] Inicializando...');

    try {
      await this.checkTokenRey();
      await this.checkStoredSession();

      this.state.initialized = true;
      console.log('[AUTH] ✓ Sistema listo');
      return true;
    } catch (error) {
      console.error('[AUTH] ✗ Error:', error);
      throw error;
    }
  },

  async checkTokenRey() {
    const users = await DatabaseManager.api.getAll('users');
    console.log('[AUTH] Usuarios en BD:', users.length);
    
    const tokenRey = users.find(u => u.level === 999);

    if (!tokenRey) {
      console.log('[AUTH] ⚠️ Token Rey no encontrado. Creando...');
      const defaultToken = {
        id: 'user_rey',
        token: 'CRGM2026',
        name: 'Administrador',
        level: 999,
        createdAt: Date.now()
      };

      try {
        await DatabaseManager.api.add('users', defaultToken);
        this.state.tokenRey = defaultToken;
        console.log('[AUTH] ✓ Token Rey creado exitosamente: CRGM2026');
        console.log('[AUTH] 💡 Puedes usar "CRGM2026" o "crgm2026" (no importan mayúsculas)');
      } catch (error) {
        console.error('[AUTH] ❌ Error al crear Token Rey:', error);
        throw error;
      }
    } else {
      this.state.tokenRey = tokenRey;
      console.log('[AUTH] ✓ Token Rey encontrado:', tokenRey.token);
    }
  },

  async checkStoredSession() {
    const sessionData = localStorage.getItem('crgm_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const valid = await this.api.validateToken(session.token);
        if (valid) {
          this.state.currentUser = session.user;
          this.emit('login', { user: session.user });
        } else {
          localStorage.removeItem('crgm_session');
        }
      } catch (error) {
        localStorage.removeItem('crgm_session');
      }
    }
  },

  api: {
    async login(token) {
      const users = await DatabaseManager.api.getAll('users');
      
      // Comparación case-insensitive (insensible a mayúsculas/minúsculas)
      const tokenUpper = token.toUpperCase();
      const user = users.find(u => u.token.toUpperCase() === tokenUpper);

      if (!user) {
        console.error('[AUTH] Token no encontrado:', token);
        console.log('[AUTH] Usuarios disponibles:', users.map(u => ({ id: u.id, token: u.token })));
        throw new Error('Token inválido. Verifica que el token sea correcto o usa el botón ♻️ para resetear.');
      }

      AuthManager.state.currentUser = user;
      localStorage.setItem('crgm_session', JSON.stringify({
        token: user.token,
        user: user,
        timestamp: Date.now()
      }));

      console.log('[AUTH] ✓ Login exitoso:', user.name);
      AuthManager.emit('login', { user });
      return user;
    },

    logout() {
      AuthManager.state.currentUser = null;
      localStorage.removeItem('crgm_session');
      AuthManager.emit('logout');
    },

    getCurrentUser() {
      return AuthManager.state.currentUser;
    },

    isAuthenticated() {
      return !!AuthManager.state.currentUser;
    },

    hasPermission(level) {
      const user = this.getCurrentUser();
      return user && user.level >= level;
    },

    async validateToken(token) {
      const users = await DatabaseManager.api.getAll('users');
      return users.some(u => u.token === token);
    },

    async createUser(userData) {
      if (!this.hasPermission(999)) {
        throw new Error('Solo Token Rey puede crear usuarios');
      }

      const newUser = {
        id: `user_${Date.now()}`,
        token: this.generateToken(),
        name: userData.name,
        level: userData.level || 10,
        createdAt: Date.now(),
        createdBy: this.getCurrentUser().id
      };

      await DatabaseManager.api.add('users', newUser);
      return newUser;
    },

    generateToken() {
      return Math.random().toString(36).substr(2, 12).toUpperCase();
    }
  },

  emit(eventName, detail = {}) {
    const event = new CustomEvent(`crgm:auth:${eventName}`, { detail });
    document.dispatchEvent(event);
  }
};

export default AuthManager;
