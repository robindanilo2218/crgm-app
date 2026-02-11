/**
 * MÓDULO: Editor de Diagramas Eléctricos
 * Versión: 2.0.0 - Con editor visual Canvas integrado
 * Integra: diagram-editor.js (Canvas + IEC Components + CSV)
 */

import { DiagramEditor } from './diagram-editor.js';

const DiagramsModule = {
  name: 'diagrams',
  version: '3.0.0',
  
  state: {
    initialized: false,
    currentEditor: null,
    symbols: []
  },

  async init() {
    console.log('[diagrams] Inicializando v2.0...');
    
    try {
      if (!window.CRGM || !window.CRGM.db || !window.CRGM.auth) {
        throw new Error('Dependencias core no disponibles');
      }
      
      this.state.initialized = true;
      console.log('[diagrams] ✓ Inicializado con editor visual');
      return true;
    } catch (error) {
      console.error('[diagrams] Error:', error);
      return false;
    }
  },

  // ============================================
  // CRUD API (IndexedDB)
  // ============================================
  api: {
    async create(data) {
      try {
        const diagram = {
          id: `diagram_${Date.now()}`,
          name: data.name || 'Nuevo Diagrama',
          description: data.description || '',
          client: data.client || '',
          designer: data.designer || '',
          voltage: data.voltage || '400V AC 3~ 50Hz',
          revision: data.revision || 'A',
          columns: 10,
          elements: [],
          wires: [],
          counters: {},
          rows: 12,
          pages: [{
            id: 'page_1',
            name: 'Hoja 1',
            type: 'general',
            elements: [],
            wires: [],
            counters: {},
            rows: 12
          }],
          workMode: 'edicion',
          createdAt: Date.now(),
          createdBy: window.CRGM.auth.getCurrentUser().id,
          updatedAt: Date.now(),
          version: 1
        };
        
        const config = await window.CRGM.db.get('config', 'diagrams') || { key: 'diagrams', data: [] };
        config.data = config.data || [];
        config.data.push(diagram);
        await window.CRGM.db.put('config', config);
        
        console.log('[diagrams] Diagrama creado:', diagram.id);
        return diagram.id;
      } catch (error) {
        console.error('[diagrams] Error al crear:', error);
        throw error;
      }
    },
    
    async list() {
      try {
        const config = await window.CRGM.db.get('config', 'diagrams') || { key: 'diagrams', data: [] };
        return config.data || [];
      } catch (error) {
        console.error('[diagrams] Error al listar:', error);
        return [];
      }
    },
    
    async getById(id) {
      const diagrams = await this.list();
      return diagrams.find(d => d.id === id);
    },
    
    async update(diagram) {
      try {
        const config = await window.CRGM.db.get('config', 'diagrams') || { key: 'diagrams', data: [] };
        const idx = (config.data || []).findIndex(d => d.id === diagram.id);
        if (idx === -1) throw new Error('Diagrama no encontrado: ' + diagram.id);
        config.data[idx] = diagram;
        await window.CRGM.db.put('config', config);
        console.log('[diagrams] Diagrama actualizado:', diagram.id);
        return true;
      } catch (error) {
        console.error('[diagrams] Error al actualizar:', error);
        throw error;
      }
    },
    
    async delete(id) {
      try {
        const config = await window.CRGM.db.get('config', 'diagrams') || { key: 'diagrams', data: [] };
        config.data = (config.data || []).filter(d => d.id !== id);
        await window.CRGM.db.put('config', config);
        console.log('[diagrams] Diagrama eliminado:', id);
        return true;
      } catch (error) {
        console.error('[diagrams] Error al eliminar:', error);
        throw error;
      }
    }
  },

  // ============================================
  // VISTAS - Lista de Diagramas
  // ============================================
  renderList() {
    return `
      <div style="padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h1 style="color: var(--color-success); margin: 0;">⚡ Diagramas Eléctricos</h1>
          <button onclick="window.CRGM.diagrams.showCreateForm()" class="btn-primary">+ Nuevo Diagrama</button>
        </div>
        <div id="diagrams-list" style="display: grid; gap: 1rem;">Cargando...</div>
      </div>
    `;
  },
  
  async loadList() {
    try {
      const diagrams = await this.api.list();
      const container = document.getElementById('diagrams-list');
      
      if (!container) return;
      
      if (diagrams.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
            <p style="color: var(--color-text-dim); margin-bottom: 1rem;">No hay diagramas creados.</p>
            <button onclick="window.CRGM.diagrams.showCreateForm()" class="btn-primary">Crear primer diagrama</button>
          </div>
        `;
        return;
      }
      
      container.innerHTML = diagrams.map(d => {
        const elCount = (d.elements || []).length;
        const wireCount = (d.wires || []).length;
        const pageCount = (d.pages || []).length || 1;
        const mode = d.workMode || 'edicion';
        const modeIcons = { edicion: '✏️', revision: '👁️', finalizado: '🔒' };
        const modeNames = { edicion: 'Edición', revision: 'Revisión', finalizado: 'Finalizado' };
        const modeColors = { edicion: '#00ff41', revision: '#ffdd00', finalizado: '#ff3300' };
        const date = new Date(d.updatedAt || d.createdAt).toLocaleDateString('es-GT');
        return `
          <div class="diagram-card">
            <div class="diagram-card-header">
              <h3 style="color: var(--color-text); margin: 0;">${d.name}</h3>
              <span style="color:${modeColors[mode]};font-size:0.75rem;font-weight:bold;">${modeIcons[mode]} ${modeNames[mode]}</span>
            </div>
            <p style="color: var(--color-text-dim); font-size: 0.875rem; margin: 0.5rem 0;">${d.description || 'Sin descripción'}</p>
            <div style="display: flex; gap: 1rem; color: var(--color-text-dim); font-size: 0.75rem; margin-bottom: 0.75rem;">
              <span>📄 ${pageCount} hoja${pageCount > 1 ? 's' : ''}</span>
              <span>🔧 ${elCount} comp.</span>
              <span>🔗 ${wireCount} cables</span>
              <span style="margin-left:auto;color:#555;">v${d.version || 1} · ${date}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button onclick="window.CRGM.diagrams.viewDiagram('${d.id}')" style="padding: 0.5rem 1rem; background: var(--color-success); color: var(--color-bg); border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">✏️ Abrir Editor</button>
              <button onclick="window.CRGM.diagrams.duplicateDiagram('${d.id}')" style="padding: 0.5rem 1rem; background: var(--color-info); color: var(--color-bg); border: none; border-radius: 4px; cursor: pointer;">📋 Duplicar</button>
              <button onclick="window.CRGM.diagrams.deleteDiagram('${d.id}')" style="padding: 0.5rem 1rem; background: var(--color-danger); color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️ Eliminar</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('[diagrams] Error al cargar lista:', error);
    }
  },
  
  // ============================================
  // CREAR DIAGRAMA
  // ============================================
  showCreateForm() {
    document.getElementById('view-container').innerHTML = `
      <div style="padding: 1rem; max-width: 600px; margin: 0 auto;">
        <button onclick="window.CRGM.navigate('/diagrams')" style="padding: 0.5rem 1rem; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer; margin-bottom: 1rem;">← Volver</button>
        <h1 style="color: var(--color-success);">⚡ Nuevo Diagrama</h1>
        <p style="color: var(--color-text-dim); margin-bottom: 1.5rem;">Crea un diagrama eléctrico con editor visual Canvas</p>
        <form id="diagram-form">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--color-text-dim); margin-bottom: 0.25rem; font-size: 0.875rem;">Nombre del diagrama *</label>
            <input type="text" id="diagram-name" placeholder="Ej: Panel Principal Línea 1" required style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text); font-size: 1rem;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--color-text-dim); margin-bottom: 0.25rem; font-size: 0.875rem;">Descripción</label>
            <textarea id="diagram-description" placeholder="Descripción del circuito o panel..." rows="2" style="width: 100%; padding: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text); font-size: 1rem;"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
            <div>
              <label style="display: block; color: var(--color-text-dim); margin-bottom: 0.25rem; font-size: 0.875rem;">Cliente</label>
              <input type="text" id="diagram-client" placeholder="Nombre del cliente" style="width:100%;padding:0.75rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:4px;color:var(--color-text);font-size:0.9rem;">
            </div>
            <div>
              <label style="display: block; color: var(--color-text-dim); margin-bottom: 0.25rem; font-size: 0.875rem;">Diseñador</label>
              <input type="text" id="diagram-designer" placeholder="Tu nombre" style="width:100%;padding:0.75rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:4px;color:var(--color-text);font-size:0.9rem;">
            </div>
            <div>
              <label style="display: block; color: var(--color-text-dim); margin-bottom: 0.25rem; font-size: 0.875rem;">Tensión nominal</label>
              <input type="text" id="diagram-voltage" value="400V AC 3~ 50Hz" style="width:100%;padding:0.75rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:4px;color:var(--color-text);font-size:0.9rem;">
            </div>
            <div>
              <label style="display: block; color: var(--color-text-dim); margin-bottom: 0.25rem; font-size: 0.875rem;">Revisión</label>
              <input type="text" id="diagram-revision" value="A" style="width:100%;padding:0.75rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:4px;color:var(--color-text);font-size:0.9rem;">
            </div>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">⚡ Crear y Abrir Editor</button>
        </form>
      </div>
    `;
    
    document.getElementById('diagram-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const id = await DiagramsModule.api.create({
          name: document.getElementById('diagram-name').value,
          description: document.getElementById('diagram-description').value,
          client: document.getElementById('diagram-client').value,
          designer: document.getElementById('diagram-designer').value,
          voltage: document.getElementById('diagram-voltage').value,
          revision: document.getElementById('diagram-revision').value
        });
        // Open editor directly
        DiagramsModule.viewDiagram(id);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  },
  
  // ============================================
  // ABRIR EDITOR VISUAL
  // ============================================
  async viewDiagram(id) {
    const diagram = await this.api.getById(id);
    if (!diagram) {
      alert('Diagrama no encontrado');
      return;
    }

    // Ensure data fields exist (migration for old diagrams)
    diagram.elements = diagram.elements || [];
    diagram.wires = diagram.wires || [];
    diagram.counters = diagram.counters || {};
    diagram.rows = diagram.rows || 12;
    
    // Destroy previous editor if exists
    if (this.state.currentEditor) {
      this.state.currentEditor.destroy();
      this.state.currentEditor = null;
    }
    
    const container = document.getElementById('view-container');
    
    // Create the editor
    const editor = new DiagramEditor(container, diagram);
    
    // Setup save callback
    editor.onSave(async (updatedDiagram) => {
      await DiagramsModule.api.update(updatedDiagram);
    });
    
    this.state.currentEditor = editor;
    console.log('[diagrams] Editor abierto para:', diagram.name);
  },
  
  // ============================================
  // DUPLICAR DIAGRAMA
  // ============================================
  async duplicateDiagram(id) {
    try {
      const original = await this.api.getById(id);
      if (!original) {
        alert('Diagrama no encontrado');
        return;
      }
      
      await this.api.create({
        name: original.name + ' (copia)',
        description: original.description
      });
      
      // Copy all data including pages to the new diagram
      const diagrams = await this.api.list();
      const newDiagram = diagrams[diagrams.length - 1];
      if (newDiagram) {
        newDiagram.elements = JSON.parse(JSON.stringify(original.elements || []));
        newDiagram.wires = JSON.parse(JSON.stringify(original.wires || []));
        newDiagram.counters = JSON.parse(JSON.stringify(original.counters || {}));
        newDiagram.rows = original.rows || 12;
        newDiagram.pages = JSON.parse(JSON.stringify(original.pages || []));
        newDiagram.workMode = 'edicion'; // Always start copy in edit mode
        await this.api.update(newDiagram);
      }
      
      // Refresh list
      if (window.CRGM && window.CRGM.navigate) {
        window.CRGM.navigate('/diagrams');
      }
    } catch (error) {
      alert('Error al duplicar: ' + error.message);
    }
  },
  
  // ============================================
  // ELIMINAR DIAGRAMA
  // ============================================
  async deleteDiagram(id) {
    if (confirm('¿Eliminar este diagrama? Esta acción no se puede deshacer.')) {
      try {
        await this.api.delete(id);
        if (window.CRGM && window.CRGM.navigate) {
          window.CRGM.navigate('/diagrams');
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  }
};

export default DiagramsModule;
