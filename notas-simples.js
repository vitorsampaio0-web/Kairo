// Substituir TODAS as funcoes de notas por estas versoes simples

async function criarNota() {
  const id = Date.now().toString();
  const agora = new Date().toISOString();
  const nova = { id, titulo: "", conteudo: "", tags: [], userId: currentUser.uid, createdAt: agora, updatedAt: agora };
  appState.notas.unshift(nova);
  appState.notaSelecionada = nova;
  fsSet("notas", id, nova);
  renderNotasSimples();
  setTimeout(() => document.getElementById("nota-editor-titulo")?.focus(), 50);
}

function guardarNotaAtual() {
  if (!appState.notaSelecionada) return;
  const n = appState.notaSelecionada;
  const titulo = document.getElementById("nota-editor-titulo")?.value || "";
  const conteudo = document.getElementById("nota-editor-conteudo")?.value || "";
  const tagsRaw = document.getElementById("nota-editor-tags")?.value || "";
  const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
  const updatedAt = new Date().toISOString();
  
  n.titulo = titulo;
  n.conteudo = conteudo;
  n.tags = tags;
  n.updatedAt = updatedAt;
  
  fsUpdate("notas", n.id, { titulo, conteudo, tags, updatedAt });
}

function eliminarNotaAtual() {
  if (!appState.notaSelecionada) return;
  if (!confirm("Eliminar esta nota?")) return;
  const id = appState.notaSelecionada.id;
  appState.notas = appState.notas.filter(n => n.id !== id);
  appState.notaSelecionada = null;
  fsDelete("notas", id);
  renderNotasSimples();
  showToast("Nota eliminada.");
}

function selecionarNota(idx) {
  const visiveis = getVisibleNotas();
  appState.notaSelecionada = visiveis[idx] || null;
  renderNotasSimples();
}

async function renderNotasSimples() {
  const view = document.getElementById("notas-view");
  if (!view) return;
  
  const notas = getVisibleNotas();
  const n = appState.notaSelecionada;
  
  view.innerHTML = `
    <div class="notas-wrapper">
      <div class="notas-sidebar">
        <div class="notas-header"><h3>As minhas notas</h3><p>${notas.length} nota${notas.length !== 1 ? 's' : ''}</p></div>
        <div class="notas-search"><i data-lucide="search"></i><input id="notas-search-input" type="text" placeholder="Pesquisar..." value="${appState.notasSearch || ''}"></div>
        <div class="notas-nova-btn" id="nota-nova-btn"><i data-lucide="plus"></i> Nova nota</div>
        <div class="notas-lista" id="notas-lista">
          ${notas.length ? notas.map((nota, i) => `
            <div class="nota-item ${n && n.id === nota.id ? 'active' : ''}" data-idx="${i}">
              <div class="nota-item-titulo">${nota.titulo || 'Nota sem título'}</div>
              <div class="nota-item-meta">${formatDateHora(nota.updatedAt || nota.createdAt)}</div>
            </div>
          `).join('') : '<div class="empty-state">Nenhuma nota. Cria uma nova.</div>'}
        </div>
      </div>
      <div class="notas-editor">
        ${n ? `
          <div class="notas-editor-barra">
            <input class="notas-editor-titulo" id="nota-editor-titulo" value="${escapeHtml(n.titulo)}" placeholder="Título">
            <div class="notas-editor-acoes">
              <button class="notas-editor-btn primary" id="nota-guardar-btn"><i data-lucide="save"></i> Guardar</button>
              <button class="notas-editor-btn danger" id="nota-eliminar-btn"><i data-lucide="trash-2"></i> Eliminar</button>
            </div>
          </div>
          <textarea class="notas-editor-conteudo" id="nota-editor-conteudo" placeholder="Escreve aqui...">${escapeHtml(n.conteudo)}</textarea>
        ` : '<div class="notas-editor-vazio"><div style="text-align:center;opacity:0.4"><i data-lucide="book-marked" style="width:56px;height:56px;margin-bottom:14px"></i><h4>Seleciona uma nota ou cria nova</h4></div></div>'}
      </div>
    </div>
  `;
  
  // Event listeners
  document.getElementById('nota-nova-btn')?.addEventListener('click', criarNota);
  document.getElementById('nota-guardar-btn')?.addEventListener('click', () => { guardarNotaAtual(); renderNotasSimples(); showToast('Guardado.'); });
  document.getElementById('nota-eliminar-btn')?.addEventListener('click', eliminarNotaAtual);
  document.getElementById('notas-search-input')?.addEventListener('input', e => { appState.notasSearch = e.target.value; renderNotasSimples(); });
  document.querySelectorAll('.nota-item').forEach(el => {
    el.addEventListener('click', () => selecionarNota(parseInt(el.dataset.idx)));
  });
  
  lucide.createIcons();
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
