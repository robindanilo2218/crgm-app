/**
 * CRGM-API - Controlador Principal
 * Punto de entrada de la aplicación
 */

import DatabaseManager from './core/database.js';
import AuthManager from './core/auth.js';
import ModuleManager from './core/modules.js';
import DiagramsModule from './modules/diagrams.js';
import ProjectsModule from './modules/projects.js';
import SyncManager from './modules/sync-manager.js';

// Namespace global
window.CRGM = {
  version: '4.0.0',
  modules: null,
  auth: null,
  db: null,
  diagrams: null,
  projects: null,
  ui: {},
  theme: null
};

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
  console.log('🚀 CRGM-API Iniciando...');
  console.log('[INIT] Versión:', window.CRGM.version);

  try {
    // 1. Registrar Service Worker (opcional - no bloquea)
    console.log('[INIT] Paso 1/4: Registrando Service Worker...');
    await registerServiceWorker();

    // 2. Inicializar módulos core
    console.log('[INIT] Paso 2/4: Inicializando módulos core...');
    await initCoreModules();

    // 3. Configurar UI
    console.log('[INIT] Paso 3/4: Configurando interfaz...');
    setupUI();

    // 4. Verificar autenticación
    console.log('[INIT] Paso 4/4: Verificando autenticación...');
    checkAuth();

    console.log('✅ CRGM-API Lista y Operativa');

  } catch (error) {
    console.error('❌ Error fatal durante inicialización:', error);
    console.error('📍 Stack trace:', error.stack);

    // Mostrar error detallado en pantalla
    document.body.innerHTML = `
      <div style="padding: 2rem; background: #000; color: #ff3300; font-family: monospace; min-height: 100vh;">
        <h1 style="color: #ff3300;">❌ Error de Inicialización</h1>
        <p style="color: #e0e0e0; margin: 1rem 0;">
          <strong>Mensaje:</strong> ${error.message}
        </p>
        <details style="margin: 1rem 0;">
          <summary style="cursor: pointer; color: #00ddff;">Ver detalles técnicos</summary>
          <pre style="background: #1a1a1a; padding: 1rem; overflow: auto; margin-top: 0.5rem; color: #e0e0e0;">${error.stack || 'No stack trace available'}</pre>
        </details>
        <div style="margin-top: 2rem;">
          <button onclick="location.reload()" style="padding: 1rem 2rem; background: #00ff41; color: #000; border: none; cursor: pointer; font-size: 1rem; border-radius: 4px; margin-right: 1rem;">
            🔄 Recargar Aplicación
          </button>
          <button onclick="clearAllData()" style="padding: 1rem 2rem; background: #ff9900; color: #000; border: none; cursor: pointer; font-size: 1rem; border-radius: 4px;">
            🗑️ Limpiar Todo y Reiniciar
          </button>
        </div>
        <script>
          function clearAllData() {
            // Limpiar IndexedDB
            indexedDB.deleteDatabase('crgm_industrial_db');
            // Limpiar LocalStorage
            localStorage.clear();
            // Limpiar SessionStorage
            sessionStorage.clear();
            // Desregistrar Service Workers
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(reg => reg.unregister());
              });
            }
            // Recargar
            setTimeout(() => location.reload(), 500);
          }
        </script>
      </div>
    `;
  }
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] ✓ Service Worker registrado:', registration.scope);

      // Esperar a que esté activo
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      return registration;
    } catch (error) {
      console.warn('[SW] ⚠️ No se pudo registrar Service Worker:', error.message);
      console.warn('[SW] La aplicación funcionará sin modo offline');
      // NO lanzar error - la app puede funcionar sin SW
      return null;
    }
  } else {
    console.warn('[SW] ⚠️ Service Workers no soportados en este navegador');
    return null;
  }
}

async function initCoreModules() {
  // Inicializar en orden correcto (sin dependencias circulares)

  // 1. Inicializar DatabaseManager primero (no tiene dependencias)
  await DatabaseManager.init();

  // 2. Inicializar AuthManager (depende de DatabaseManager)
  await AuthManager.init();

  // 3. Inicializar ModuleManager (carga configuración)
  await ModuleManager.init();

  // 4. Registrar módulos DESPUÉS de inicializar
  ModuleManager.api.register(DatabaseManager);
  ModuleManager.api.register(AuthManager);
  ModuleManager.api.register(ModuleManager);

  // 5. Exponer en namespace global PRIMERO (antes de módulos adicionales)
  window.CRGM.modules = ModuleManager;
  window.CRGM.auth = AuthManager.api;
  window.CRGM.db = DatabaseManager.api;
  
  // 5.5 Inicializar SyncManager
  window.CRGM.sync = new SyncManager(DatabaseManager);
  console.log('[INIT] ✓ Sync Manager inicializado');

  // 6. Inicializar módulos adicionales (DESPUÉS de exponer dependencias)
  console.log('[INIT] Inicializando módulos adicionales...');
  try {
    await DiagramsModule.init();
    ModuleManager.api.register(DiagramsModule);
    window.CRGM.diagrams = DiagramsModule;
    console.log('[INIT] ✓ Módulo Diagrams cargado');
  } catch (error) {
    console.error('[INIT] ⚠️ Error al cargar Diagrams:', error);
  }

  try {
    await ProjectsModule.init();
    ModuleManager.api.register(ProjectsModule);
    window.CRGM.projects = ProjectsModule;
    console.log('[INIT] ✓ Módulo Projects cargado');
  } catch (error) {
    console.error('[INIT] ⚠️ Error al cargar Projects:', error);
  }
}

// ============================================
// UI Y EVENTOS
// ============================================

function setupUI() {
  // Menu toggle
  document.getElementById('menu-btn').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-close').addEventListener('click', toggleSidebar);

  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Force refresh button
  const forceRefreshBtn = document.getElementById('force-refresh-btn');
  if (forceRefreshBtn) {
    forceRefreshBtn.addEventListener('click', handleForceRefresh);
    forceRefreshBtn.addEventListener('mouseenter', (e) => {
      e.target.style.color = 'var(--color-warning)';
      e.target.style.transform = 'rotate(180deg)';
    });
    forceRefreshBtn.addEventListener('mouseleave', (e) => {
      e.target.style.color = 'var(--color-text-dim)';
      e.target.style.transform = 'rotate(0deg)';
    });
  }

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Eventos de autenticación
  document.addEventListener('crgm:auth:login', onLogin);
  document.addEventListener('crgm:auth:logout', onLogout);

  // Cerrar sidebar al hacer click fuera
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');

    if (!sidebar.contains(e.target) && e.target !== menuBtn && !sidebar.classList.contains('hidden')) {
      toggleSidebar();
    }
  });

  // Theme toggle
  initTheme();

  // Status bar
  initStatusBar();

  // Bottom nav
  initBottomNav();
}

// ============================================
// THEME MANAGER
// ============================================

function initTheme() {
  const saved = localStorage.getItem('crgm-theme') || 'dark';
  applyTheme(saved);

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('crgm-theme', next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#000000' : '#ffffff';
  window.CRGM.theme = theme;
}

// ============================================
// STATUS BAR (Network, Time, Battery)
// ============================================

function initStatusBar() {
  // Time update
  function updateTime() {
    const el = document.getElementById('status-time');
    if (el) el.textContent = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  }
  updateTime();
  setInterval(updateTime, 30000);

  // Network status
  function updateNetwork() {
    const el = document.getElementById('status-network');
    if (!el) return;
    const online = navigator.onLine;
    el.innerHTML = `<span class="status-dot ${online ? 'online' : 'offline'}"></span> ${online ? 'Online' : 'Offline'}`;
  }
  updateNetwork();
  window.addEventListener('online', updateNetwork);
  window.addEventListener('offline', updateNetwork);

  // Battery (if available)
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      function updateBattery() {
        const el = document.getElementById('status-battery');
        if (el) {
          const pct = Math.round(battery.level * 100);
          const icon = battery.charging ? '⚡' : (pct > 20 ? '🔋' : '🪫');
          el.textContent = `${icon} ${pct}%`;
        }
      }
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    }).catch(() => {});
  }
}

// ============================================
// BOTTOM NAV BAR
// ============================================

function initBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  nav.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      const routeMap = {
        home: '/',
        projects: '/projects',
        diagrams: '/diagrams',
        scanner: '/scanner',
        settings: '/settings'
      };
      if (routeMap[route]) navigate(routeMap[route]);
      updateBottomNavActive(route);
    });
  });
}

function updateBottomNavActive(activeRoute) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  nav.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === activeRoute);
  });
}

function showBottomNav(show) {
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.classList.toggle('hidden', !show);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('hidden');
}

async function handleLogin(e) {
  e.preventDefault();

  const token = document.getElementById('token-input').value.trim();
  const errorDiv = document.getElementById('login-error');

  if (!token) {
    showError('Ingresa un token', errorDiv);
    return;
  }

  showLoading(true);

  try {
    await window.CRGM.auth.login(token);
    // El evento crgm:auth:login manejará el resto
  } catch (error) {
    showError(error.message, errorDiv);
  } finally {
    showLoading(false);
  }
}

function handleLogout() {
  if (confirm('¿Cerrar sesión?')) {
    window.CRGM.auth.logout();
  }
}

async function handleForceRefresh() {
  if (!confirm('⚠️ Esto borrará TODOS los datos locales y recargará la aplicación.\n\n¿Estás seguro? Esta acción no se puede deshacer.')) {
    return;
  }

  showLoading(true);
  
  try {
    console.log('[FORCE-REFRESH] Iniciando limpieza profunda...');
    
    // 1. Limpiar IndexedDB
    console.log('[FORCE-REFRESH] Eliminando base de datos...');
    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase('crgm_industrial_db');
      req.onsuccess = () => {
        console.log('[FORCE-REFRESH] ✓ Base de datos eliminada');
        resolve();
      };
      req.onerror = () => {
        console.warn('[FORCE-REFRESH] ⚠️ Error al eliminar BD:', req.error);
        resolve(); // Continue anyway
      };
      req.onblocked = () => {
        console.warn('[FORCE-REFRESH] ⚠️ BD bloqueada, continuando...');
        resolve();
      };
    });
    
    // 2. Limpiar LocalStorage
    console.log('[FORCE-REFRESH] Limpiando LocalStorage...');
    localStorage.clear();
    
    // 3. Limpiar SessionStorage
    console.log('[FORCE-REFRESH] Limpiando SessionStorage...');
    sessionStorage.clear();
    
    // 4. Desregistrar Service Workers
    if ('serviceWorker' in navigator) {
      console.log('[FORCE-REFRESH] Desregistrando Service Workers...');
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('[FORCE-REFRESH] ✓ Service Workers desregistrados');
    }
    
    // 5. Limpiar caché
    if ('caches' in window) {
      console.log('[FORCE-REFRESH] Limpiando caché...');
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[FORCE-REFRESH] ✓ Caché limpiado');
    }
    
    console.log('[FORCE-REFRESH] ✓ Limpieza completada. Recargando...');
    
    // 6. Recargar después de un breve delay
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname;
    }, 500);
    
  } catch (error) {
    console.error('[FORCE-REFRESH] Error durante limpieza:', error);
    showLoading(false);
    alert('Error durante la limpieza: ' + error.message + '\n\nIntenta recargar manualmente (F5 o Ctrl+R).');
  }
}

function onLogin(event) {
  const user = event.detail.user;

  // Ocultar login screen
  document.getElementById('login-screen').classList.add('hidden');

  // Actualizar UI
  document.getElementById('user-badge').textContent = `${user.name} (Lv ${user.level})`;

  // Construir menu
  buildMenu(user.level);

  // Show bottom nav
  showBottomNav(true);

  // Mostrar vista principal
  renderHome();

  showToast(`Bienvenido, ${user.name}!`, 'success');
}

function onLogout() {
  // Mostrar login screen
  document.getElementById('login-screen').classList.remove('hidden');

  // Limpiar UI
  document.getElementById('user-badge').textContent = '';
  document.getElementById('token-input').value = '';

  // Limpiar vista
  document.getElementById('view-container').innerHTML = '';

  // Hide bottom nav
  showBottomNav(false);

  showToast('Sesión cerrada', 'info');
}

function checkAuth() {
  const isAuth = window.CRGM.auth.isAuthenticated();

  if (isAuth) {
    document.getElementById('login-screen').classList.add('hidden');
    const user = window.CRGM.auth.getCurrentUser();
    document.getElementById('user-badge').textContent = `${user.name} (Lv ${user.level})`;
    buildMenu(user.level);
    showBottomNav(true);
    renderHome();
  } else {
    document.getElementById('login-screen').classList.remove('hidden');
  }
}

// ============================================
// NAVEGACIÓN Y VISTAS
// ============================================

function buildMenu(userLevel) {
  const menuList = document.getElementById('menu-list');
  menuList.innerHTML = '';
  
  const menuItems = [
    { title: 'Inicio', route: '/', level: 1 },
    { title: '⚡ Diagramas', route: '/diagrams', level: 1 },
    { title: '📋 Proyectos', route: '/projects', level: 10 },
    { title: 'Escanear', route: '/scanner', level: 1 },
    { title: 'Activos', route: '/assets', level: 1 },
    { title: 'Inventario', route: '/inventory', level: 10 },
    { title: 'LOTO Digital', route: '/loto', level: 10 },
    { title: 'Administración', route: '/admin', level: 999 }
  ];

  menuItems.forEach(item => {
    if (userLevel >= item.level) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + item.route;
      a.textContent = item.title;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(item.route);
        toggleSidebar();
      });
      li.appendChild(a);
      menuList.appendChild(li);
    }
  });
}

function navigate(route) {
  // Router simple
  window.location.hash = route;
  
  switch (route) {
    case '/':
      renderHome();
      break;
    case '/diagrams':
      renderDiagrams();
      break;
    case '/projects':
      renderProjects();
      break;
    case '/scanner':
      renderScanner();
      break;
    case '/assets':
      renderAssets();
      break;
    case '/inventory':
      renderInventory();
      break;
    case '/loto':
      renderLOTO();
      break;
    case '/admin':
      renderAdmin();
      break;
    case '/settings':
      renderSettings();
      break;
    default:
      render404();
  }
}

window.CRGM.navigate = navigate;

function renderHome() {
  const user = window.CRGM.auth.getCurrentUser();
  const container = document.getElementById('view-container');
  
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <h1 style="color: var(--color-success); margin-bottom: 1rem;">
        🏭 CRGM-API
      </h1>
      <p style="color: var(--color-text-dim);">
        Sistema Operativo Industrial
      </p>
      <p style="margin-top: 2rem;">
        Usuario: <strong>${user.name}</strong><br>
        Nivel: <strong>${user.level}</strong><br>
        Token: <code>${user.token}</code>
      </p>
      <div style="margin-top: 2rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
        <h3>🚀 Módulos Disponibles:</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Base de Datos (IndexedDB)
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Sistema de Autenticación
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Gestor Modular
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Editor de Diagramas Eléctricos
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Gestión de Proyectos
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-warning); margin-bottom: 0.5rem; background: var(--color-surface);">
            ⚠ Escáner QR (Pendiente)
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-warning); margin-bottom: 0.5rem; background: var(--color-surface);">
            ⚠ LOTO Digital (Pendiente)
          </li>
        </ul>
      </div>
    </div>
  `;
}

function renderDiagrams() {
  const container = document.getElementById('view-container');
  
  if (!window.CRGM.diagrams || !window.CRGM.diagrams.state.initialized) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2 style="color: var(--color-danger);">⚠️ Módulo no disponible</h2>
        <p style="color: var(--color-text-dim);">El módulo de Diagramas no se ha cargado correctamente.</p>
        <p style="color: var(--color-text-dim); font-size: 0.875rem;">Revisa la consola para más detalles.</p>
        <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem;">Recargar Aplicación</button>
      </div>
    `;
    console.error('[diagrams] Módulo no inicializado');
    return;
  }
  
  container.innerHTML = window.CRGM.diagrams.renderList();
  window.CRGM.diagrams.loadList();
}

function renderProjects() {
  const container = document.getElementById('view-container');
  
  if (!window.CRGM.projects || !window.CRGM.projects.state.initialized) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2 style="color: var(--color-danger);">⚠️ Módulo no disponible</h2>
        <p style="color: var(--color-text-dim);">El módulo de Proyectos no se ha cargado correctamente.</p>
        <p style="color: var(--color-text-dim); font-size: 0.875rem;">Revisa la consola para más detalles.</p>
        <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem;">Recargar Aplicación</button>
      </div>
    `;
    console.error('[projects] Módulo no inicializado');
    return;
  }
  
  container.innerHTML = window.CRGM.projects.renderList();
  window.CRGM.projects.loadStats();
  window.CRGM.projects.loadList();
}

function renderScanner() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>📹 Escáner QR</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderAssets() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>🏭 Gestión de Activos</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderInventory() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>📦 Inventario</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderLOTO() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>🔒 LOTO Digital</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderAdmin() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>⚙️ Administración</h2>
      <p style="color: var(--color-warning);">Panel de administración en desarrollo...</p>
    </div>
  `;
}

function renderSettings() {
  const container = document.getElementById('view-container');
  const currentTheme = window.CRGM.theme || 'dark';
  const user = window.CRGM.auth.getCurrentUser();
  
  container.innerHTML = `
    <div style="padding: 1rem; max-width: 600px; margin: 0 auto;">
      <h2 style="color: var(--color-success); margin-bottom: 1.5rem;">⚙️ Configuración</h2>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem; border-left: 3px solid var(--color-info);">
        <h3 style="margin-bottom: 0.5rem;">🎨 Tema</h3>
        <p style="color: var(--color-text-dim); font-size: 0.85rem; margin-bottom: 0.75rem;">
          Tema actual: <strong>${currentTheme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}</strong>
        </p>
        <button class="btn-primary" onclick="document.getElementById('theme-toggle').click()" style="font-size: 0.85rem;">
          Cambiar a ${currentTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem; border-left: 3px solid var(--color-success);">
        <h3 style="margin-bottom: 0.5rem;">👤 Sesión</h3>
        <p style="color: var(--color-text-dim); font-size: 0.85rem;">
          Usuario: <strong>${user.name}</strong> | Nivel: <strong>${user.level}</strong>
        </p>
      </div>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem; border-left: 3px solid var(--color-info);">
        <h3 style="margin-bottom: 0.5rem;">⚡ Sincronización</h3>
        <p style="color: var(--color-text-dim); font-size: 0.85rem; margin-bottom: 0.75rem;">
          Exportar/Importar tus datos para respaldo o transferencia entre dispositivos.
        </p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-primary" onclick="window.CRGM.sync.exportAllData().then(() => alert('✓ Datos exportados correctamente')).catch(e => alert('Error: ' + e.message))" style="font-size: 0.85rem; width: auto;">
            📤 Exportar Datos
          </button>
          <button class="btn-primary" onclick="document.getElementById('import-file-input').click()" style="font-size: 0.85rem; width: auto;">
            📥 Importar Datos
          </button>
          <input type="file" id="import-file-input" accept=".crgm-pack,.json" style="display: none;" onchange="handleImportFile(this)" />
        </div>
      </div>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem; border-left: 3px solid var(--color-warning);">
        <h3 style="margin-bottom: 0.5rem;">💾 Datos</h3>
        <p style="color: var(--color-text-dim); font-size: 0.85rem; margin-bottom: 0.75rem;">
          Limpiar datos locales de la aplicación.
        </p>
        <button class="btn-danger" onclick="if(confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')){indexedDB.deleteDatabase('crgm_industrial_db');localStorage.clear();location.reload()}" style="font-size: 0.85rem; width: auto;">
          🗑️ Limpiar Datos y Reiniciar
        </button>
      </div>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: var(--radius); border-left: 3px solid var(--color-text-dim);">
        <h3 style="margin-bottom: 0.5rem;">ℹ️ Acerca de</h3>
        <p style="color: var(--color-text-dim); font-size: 0.85rem;">
          CRGM-API v${window.CRGM.version}<br>
          Sistema Operativo Industrial<br>
          PWA Offline-First
        </p>
      </div>
    </div>
  `;
}

function render404() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem; text-align: center;">
      <h2 style="color: var(--color-danger);">404</h2>
      <p>Página no encontrada</p>
    </div>
  `;
}

// ============================================
// UTILIDADES UI
// ============================================

function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.toggle('hidden', !show);
}

function showError(message, container = null) {
  if (container) {
    container.textContent = message;
    container.classList.remove('hidden');
    setTimeout(() => container.classList.add('hidden'), 5000);
  } else {
    showToast(message, 'error');
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// SINCRONIZACIÓN - HANDLERS
// ============================================

window.handleImportFile = async function(input) {
  const file = input.files[0];
  if (!file) return;
  
  showLoading(true);
  
  try {
    const result = await window.CRGM.sync.importData(file);
    showToast(`✓ Importados ${result.totalRecords} registros`, 'success');
    
    // Preguntar si desea recargar
    if (confirm('Datos importados correctamente. ¿Recargar la aplicación para ver los cambios?')) {
      location.reload();
    }
  } catch (error) {
    showToast(`Error al importar: ${error.message}`, 'error');
    console.error('Import error:', error);
  } finally {
    showLoading(false);
    input.value = ''; // Reset input
  }
};

// ============================================
// ARRANCAR APLICACIÓN
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
