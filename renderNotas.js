    async function renderNotas() {
      const notasView = document.getElementById("notas-view");
      if (!notasView) return;
      const notas = appState.notas || [];
      const equipaNomes = (appState.equipa || []).filter(m => m.userId !== (currentUser && currentUser.uid)).map(m => ({ id: m.userId, nome: m.nome, email: m.email }));
      const sharedWithMe = notas.filter(n => n.sharedWith && n.sharedWith.includes(currentUser && currentUser.uid)).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      const minhas = notas.filter(n => n.userId === (currentUser && currentUser.uid) && (!n.sharedWith || n.sharedWith.length === 0)).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      const todas = [...minhas, ...sharedWithMe];
      const searchTerm = (appState.notasSearch || "").toLowerCase();
      const filtered = searchTerm ? todas.filter(n => (n.titulo || "").toLowerCase().includes(searchTerm) || (n.conteudo || "").toLowerCase().includes(searchTerm) || (n.tags || []).some(t => t.toLowerCase().includes(searchTerm))) : todas;
      const msg = window.webkitSpeechRecognition || window.SpeechRecognition ? null : { tipo: "warning", txt: "O teu browser não suporta ditado de voz. Usa Chrome, Edge ou Safari." };

      notasView.innerHTML = `
        <div class="notas-wrapper">
          <div class="notas-sidebar">
            <div class="notas-header">
              <h3>As minhas notas</h3>
              <p>${filtered.length} nota${filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div class="notas-search">
              <i data-lucide="search"></i>
              <input id="notas-search-input" type="text" placeholder="Pesquisar notas..." value="${appState.notasSearch || ""}">
            </div>
            <div class="notas-nova-btn" id="nota-nova-btn">
              <i data-lucide="plus"></i> Nova nota
            </div>
            <div class="notas-lista" id="notas-lista">
              ${filtered.length ? filtered.map((n, idx) => `
                <div class="nota-item ${(appState.notaSelecionada && appState.notaSelecionada.id === n.id) ? "active" : ""}" data-nota-index="${idx}">
                  <div class="nota-item-titulo">${n.titulo || "Nota sem título"}</div>
                  <div class="nota-item-meta">${formatDateHora(n.updatedAt || n.createdAt)}${(n.tags || []).length ? ' &middot; ' + (n.tags || []).slice(0, 2).map(t => `<span class="nota-tag-chip">${t}</span>`).join("") : ""}</div>
                </div>
              `).join("") : `<div class="empty-state">Nenhuma nota ainda. Cria a tua primeira nota acima.</div>`}
            </div>
          </div>
          <div class="notas-editor" id="notas-editor">
            ${appState.notaSelecionada ? (() => {
              const n = appState.notaSelecionada;
              return `
                <div class="notas-editor-barra">
                  <input class="notas-editor-titulo" id="nota-editor-titulo" value="${n.titulo || ""}" placeholder="Título da nota">
                  <div class="notas-editor-acoes">
                    ${n.userId === (currentUser && currentUser.uid) ? `
                    <button class="notas-editor-btn ${appState.isRecordingNote ? "green" : ""}" id="nota-ditar-btn" title="Ditar por voz">
                      <i data-lucide="${appState.isRecordingNote ? 'mic-off' : 'mic'}"></i> ${appState.isRecordingNote ? "A ouvir..." : "Ditar"}
                    </button>
                    <button class="notas-editor-btn secondary" id="nota-partilhar-btn" title="Partilhar com equipa">
                      <i data-lucide="share-2"></i> Partilhar
                    </button>
                    <button class="notas-editor-btn danger" id="nota-eliminar-btn" title="Eliminar nota">
                      <i data-lucide="trash-2"></i>
                    </button>` : `<span class="nota-shared-badge"><i data-lucide="users"></i> Partilhada contigo</span>`}
                  </div>
                </div>
                <div class="notas-tags-row">
                  <input class="notas-tags-input" id="nota-editor-tags" placeholder="Etiquetas (separadas por vírgula)" value="${(n.tags || []).join(", ")}">
                </div>
                <textarea class="notas-editor-conteudo" id="nota-editor-conteudo" placeholder="Escreve a tua nota aqui...">${n.conteudo || ""}</textarea>
                <div class="notas-editor-pes">${n.audioTranscrito ? `<span class="nota-pill"><i data-lucide="mic"></i> Transcrita por voz &middot; ${formatDateHora(n.updatedAt || n.createdAt)}</span>` : `<span class="nota-pill">${formatDateHora(n.updatedAt || n.createdAt)}</span>`}</div>
              `;
            })() : `
              <div class="notas-editor-vazio">
                <div style="text-align:center;opacity:0.4;">
                  <i data-lucide="book-marked" style="width:56px;height:56px;margin-bottom:14px;"></i>
                  <h4>Seleciona uma nota à esquerda ou cria uma nova</h4>
                  <p>As tuas notas são sincronizadas em tempo real</p>
                </div>
              </div>
            `}
          </div>
        </div>

        ${msg ? `<div class="toast-bar ${msg.tipo}">${msg.txt}</div>` : ""}
      `;

      if (!document.getElementById("nota-share-modal")) {
        const modal = document.createElement("div");
        modal.id = "nota-share-modal";
        modal.className = "modal-overlay hidden";
        modal.innerHTML = `
          <div class="modal-card" style="max-width:420px;">
            <div class="modal-head">
              <h3>Partilhar nota</h3>
              <button class="close-modal" data-close-modal><i data-lucide="x"></i></button>
            </div>
            <div style="padding:16px;">
              <p style="margin-bottom:12px;font-size:0.82rem;color:var(--muted);">Seleciona os membros da equipa com quem queres partilhar esta nota:</p>
              <div class="share-list" id="share-members-list" style="max-height:240px;overflow-y:auto;">
                ${equipaNomes.length ? equipaNomes.map(m => `
                  <label style="display:flex;align-items:center;gap:10px;padding:8px 0;cursor:pointer;border-bottom:1px solid rgba(124,92,255,0.08);">
                    <input type="checkbox" value="${m.id}" data-share-member>
                    <span style="font-size:0.8rem;">${m.nome || m.email}</span>
                  </label>
                `).join("") : `<div class="empty-state" style="padding:20px 0;">Nenhum membro na equipa.</div>`}
              </div>
              <div style="display:flex;justify_content:flex-end;gap:10px;margin-top:16px;">
                <button class="ghost-btn" data-close-modal>Cancelar</button>
                <button class="primary-btn" id="btn-confirmar-share">Partilhar</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
    }
