/**
 * MÓDULO: Gestión de Proyectos
 * Versión: 1.0.1 - Simplificado
 */

const ProjectsModule = {
  name: 'projects',
  version: '1.0.1',
  
  state: {
    initialized: false
  },

  async init() {
    console.log('[projects] Inicializando...');
    
    try {
      // Verificar dependencias básicas
      if (!window.CRGM || !window.CRGM.db || !window.CRGM.auth) {
        throw new Error('Dependencias core no disponibles');
      }
      
      this.state.initialized = true;
      console.log('[projects] ✓ Inicializado correctamente');
      return true;
    } catch (error) {
      console.error('[projects] Error:', error);
      return false;
    }
  },

  api: {
    async create(data) {
      try {
        const project = {
          id: `project_${Date.now()}`,
          name: data.name || 'Nuevo Proyecto',
          description: data.description || '',
          status: 'propuesta',
          priority: data.priority || 'media',
          company: data.company || '',
          area: data.area || '',
          machine: data.machine || '',
          budget: {
            estimated: data.budgetEstimated || 0,
            actual: 0,
            currency: 'USD'
          },
          timeline: {
            estimatedDuration: data.estimatedDuration || 0,
            actualDuration: 0
          },
          tasks: [],
          createdAt: Date.now(),
          createdBy: window.CRGM.auth.getCurrentUser().id,
          version: 1
        };
        
        // Guardar en config store
        const config = await window.CRGM.db.get('config', 'projects') || { key: 'projects', data: [] };
        config.data = config.data || [];
        config.data.push(project);
        await window.CRGM.db.put('config', config);
        
        console.log('[projects] Proyecto creado:', project.id);
        return project.id;
      } catch (error) {
        console.error('[projects] Error al crear:', error);
        throw error;
      }
    },
    
    async list(filter = {}) {
      try {
        const config = await window.CRGM.db.get('config', 'projects') || { key: 'projects', data: [] };
        let projects = config.data || [];
        
        // Aplicar filtros
        if (filter.status) {
          projects = projects.filter(p => p.status === filter.status);
        }
        if (filter.priority) {
          projects = projects.filter(p => p.priority === filter.priority);
        }
        
        return projects;
      } catch (error) {
        console.error('[projects] Error al listar:', error);
        return [];
      }
    },
    
    async getById(id) {
      const projects = await this.list();
      return projects.find(p => p.id === id);
    },
    
    async delete(id) {
      try {
        const config = await window.CRGM.db.get('config', 'projects') || { key: 'projects', data: [] };
        config.data = (config.data || []).filter(p => p.id !== id);
        await window.CRGM.db.put('config', config);
        console.log('[projects] Proyecto eliminado:', id);
        return true;
      } catch (error) {
        console.error('[projects] Error al eliminar:', error);
        throw error;
      }
    },
    
    async getStats() {
      const projects = await this.list();
      
      return {
        total: projects.length,
        byStatus: {
          propuesta: projects.filter(p => p.status === 'propuesta').length,
          aprobado: projects.filter(p => p.status === 'aprobado').length,
          implementacion: projects.filter(p => p.status === 'implementacion').length,
          implementado: projects.filter(p => p.status === 'implementado').length
        },
        totalBudget: projects.reduce((sum, p) => sum + (p.budget?.estimated || 0), 0)
      };
    }
  },

  renderList() {
    return `
      <div style="padding: 1rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
          <h1 style="color: var(--color-success);">📋 Gestión de Proyectos</h1>
          <button onclick="window.CRGM.projects.showCreateForm()" class="btn-primary">+ Nuevo</button>
        </div>
        <div id="projects-stats" style="margin-bottom: 1rem;">Cargando estadísticas...</div>
        <div id="projects-list">Cargando...</div>
      </div>
    `;
  },
  
  async loadStats() {
    try {
      const stats = await this.api.getStats();
      const container = document.getElementById('projects-stats');
      
      if (!container) return;
      
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
          <div style="background: var(--color-surface); padding: 1rem; border-radius: 4px; text-align: center;">
            <div style="font-size: 2rem; color: var(--color-success);">${stats.total}</div>
            <div style="color: var(--color-text-dim); font-size: 0.875rem;">Total</div>
          </div>
          <div style="background: var(--color-surface); padding: 1rem; border-radius: 4px; text-align: center;">
            <div style="font-size: 2rem; color: var(--color-warning);">${stats.byStatus.implementacion}</div>
            <div style="color: var(--color-text-dim); font-size: 0.875rem;">En Proceso</div>
          </div>
          <div style="background: var(--color-surface); padding: 1rem; border-radius: 4px; text-align: center;">
            <div style="font-size: 1.5rem; color: var(--color-info);">$${stats.totalBudget.toLocaleString()}</div>
            <div style="color: var(--color-text-dim); font-size: 0.875rem;">Presupuesto</div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('[projects] Error al cargar stats:', error);
    }
  },
  
  async loadList() {
    try {
      const projects = await this.api.list();
      const container = document.getElementById('projects-list');
      
      if (!container) return;
      
      if (projects.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-dim); padding: 2rem; text-align: center;">No hay proyectos.</p>';
        return;
      }
      
      container.innerHTML = projects.map(p => `
        <div style="background: var(--color-surface); padding: 1rem; margin-bottom: 1rem; border-radius: 4px; border-left: 3px solid var(--color-info);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <h3 style="color: var(--color-text); margin: 0;">${p.name}</h3>
            <span style="padding: 0.25rem 0.5rem; background: var(--color-success); color: var(--color-bg); border-radius: 4px; font-size: 0.75rem;">${p.status}</span>
          </div>
          <p style="color: var(--color-text-dim); font-size: 0.875rem;">${p.description || 'Sin descripción'}</p>
          <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--color-text-dim);">
            ${p.company ? `🏢 ${p.company} | ` : ''}
            Presupuesto: $${(p.budget?.estimated || 0).toLocaleString()}
          </div>
          <div style="margin-top: 1rem;">
            <button onclick="window.CRGM.projects.viewProject('${p.id}')" style="padding: 0.5rem 1rem; background: var(--color-info); color: var(--color-bg); border: none; border-radius: 4px; cursor: pointer;">Ver Detalles</button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('[projects] Error al cargar lista:', error);
    }
  },
  
  showCreateForm() {
    document.getElementById('view-container').innerHTML = `
      <div style="padding: 1rem;">
        <button onclick="window.CRGM.navigate('/projects')" style="padding: 0.5rem 1rem; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer; margin-bottom: 1rem;">← Volver</button>
        <h1 style="color: var(--color-success);">Nuevo Proyecto</h1>
        <form id="project-form" style="max-width: 800px; margin-top: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="grid-column: 1 / -1;">
              <input type="text" id="project-name" placeholder="Nombre del proyecto *" required style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text);">
            </div>
            <div style="grid-column: 1 / -1;">
              <textarea id="project-description" placeholder="Descripción" rows="3" style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text);"></textarea>
            </div>
            <div>
              <select id="project-priority" style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text);">
                <option value="baja">Prioridad: Baja</option>
                <option value="media" selected>Prioridad: Media</option>
                <option value="alta">Prioridad: Alta</option>
              </select>
            </div>
            <div>
              <input type="number" id="project-budget" placeholder="Presupuesto (USD)" min="0" style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text);">
            </div>
            <div>
              <input type="text" id="project-company" placeholder="Empresa" style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text);">
            </div>
            <div>
              <input type="text" id="project-area" placeholder="Área" style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text);">
            </div>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1.5rem;">Crear Proyecto</button>
        </form>
      </div>
    `;
    
    document.getElementById('project-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await ProjectsModule.api.create({
          name: document.getElementById('project-name').value,
          description: document.getElementById('project-description').value,
          priority: document.getElementById('project-priority').value,
          budgetEstimated: parseFloat(document.getElementById('project-budget').value) || 0,
          company: document.getElementById('project-company').value,
          area: document.getElementById('project-area').value
        });
        alert('Proyecto creado exitosamente');
        window.CRGM.navigate('/projects');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  },
  
  async viewProject(id) {
    const project = await this.api.getById(id);
    if (!project) {
      alert('Proyecto no encontrado');
      return;
    }
    
    document.getElementById('view-container').innerHTML = `
      <div style="padding: 1rem;">
        <button onclick="window.CRGM.navigate('/projects')" style="padding: 0.5rem 1rem; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer; margin-bottom: 1rem;">← Volver</button>
        <h1 style="color: var(--color-success);">${project.name}</h1>
        <p style="color: var(--color-text-dim);">${project.description}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
          <div style="background: var(--color-surface); padding: 1rem; border-radius: 4px;">
            <h3 style="color: var(--color-info); margin-bottom: 0.5rem;">Estado</h3>
            <p style="color: var(--color-text);">${project.status}</p>
          </div>
          <div style="background: var(--color-surface); padding: 1rem; border-radius: 4px;">
            <h3 style="color: var(--color-info); margin-bottom: 0.5rem;">Presupuesto</h3>
            <p style="color: var(--color-text);">$${(project.budget?.estimated || 0).toLocaleString()} USD</p>
          </div>
          <div style="background: var(--color-surface); padding: 1rem; border-radius: 4px;">
            <h3 style="color: var(--color-info); margin-bottom: 0.5rem;">Empresa</h3>
            <p style="color: var(--color-text);">${project.company || 'No especificado'}</p>
          </div>
        </div>
      </div>
    `;
  },
  
  async applyFilters() {
    await this.loadList();
  }
};

export default ProjectsModule;
