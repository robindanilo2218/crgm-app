/**
 * CORE: Module Manager
 * Sistema modular para cargar/descargar módulos dinámicamente
 */

const ModuleManager = {
  name: 'core.modules',
  version: '1.0.0',

  state: {
    initialized: false,
    modules: new Map(),
    config: null
  },

  async init() {
    console.log('[MODULES] Inicializando gestor modular...');

    // Cargar configuración
    await this.loadConfig();

    this.state.initialized = true;
    console.log('[MODULES] ✓ Gestor listo');
    return true;
  },

  async loadConfig() {
    try {
      const response = await fetch('/CONFIG_MODULES.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.state.config = await response.json();
      console.log('[MODULES] Configuración cargada');
    } catch (error) {
      console.warn('[MODULES] No se pudo cargar CONFIG_MODULES.json, usando configuración por defecto');
      console.warn('[MODULES] Error:', error.message);
      // Configuración mínima por defecto
      this.state.config = {
        core: { modules: [] },
        essential: { modules: [] },
        optional: { modules: [] },
        admin: { modules: [] },
        settings: {
          autoLoadModules: false,
          debugMode: true
        }
      };
    }
  },

  api: {
    register(module) {
      if (!module.name) {
        console.error('[MODULES] Módulo sin nombre');
        return false;
      }

      ModuleManager.state.modules.set(module.name, module);
      console.log(`[MODULES] ✓ Registrado: ${module.name}`);
      return true;
    },

    get(moduleName) {
      return ModuleManager.state.modules.get(moduleName);
    },

    has(moduleName) {
      return ModuleManager.state.modules.has(moduleName);
    },

    async loadModule(moduleName) {
      const config = ModuleManager.state.config;

      // Buscar en todas las categorías
      let moduleConfig = null;
      for (const category of Object.values(config)) {
        if (category.modules) {
          moduleConfig = category.modules.find(m => m.id === moduleName);
          if (moduleConfig) break;
        }
      }

      if (!moduleConfig) {
        throw new Error(`Módulo no encontrado: ${moduleName}`);
      }

      if (!moduleConfig.enabled) {
        console.warn(`[MODULES] Módulo deshabilitado: ${moduleName}`);
        return false;
      }

      try {
        const modulePath = `/js/${moduleConfig.file}`;
        const module = await import(modulePath);

        this.register(module.default);

        // Inicializar si tiene método init
        if (module.default.init) {
          await module.default.init();
        }

        return true;
      } catch (error) {
        console.error(`[MODULES] Error al cargar ${moduleName}:`, error);
        return false;
      }
    },

    getAll() {
      return Array.from(ModuleManager.state.modules.values());
    },

    async unload(moduleName) {
      const module = ModuleManager.state.modules.get(moduleName);

      if (!module) {
        console.warn(`[MODULES] Módulo no encontrado: ${moduleName}`);
        return false;
      }

      // Llamar destroy si existe
      if (module.destroy) {
        await module.destroy();
      }

      ModuleManager.state.modules.delete(moduleName);
      console.log(`[MODULES] ✓ Descargado: ${moduleName}`);
      return true;
    }
  }
};

export default ModuleManager;
