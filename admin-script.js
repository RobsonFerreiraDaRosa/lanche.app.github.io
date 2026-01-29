// ===== CONFIGURAÇÕES DE SEGURANÇA =====
const ADMIN_PASSWORD = "jovemtribo"; // 🔐 ALTERE ESTA SENHA - SEM ESPAÇOS NO INÍCIO/FIM

// ===== CHAVES DE ARMAZENAMENTO =====
const STORAGE_KEYS = {
    SISTEMA: "tribo_sistema_config",
    PIX: "carrinho_tribo_pix",
    MENU: "carrinho_tribo_menu",
    BACKUP_HISTORY: "tribo_backup_history",
    LAST_UPDATE: "tribo_last_update"
};

// ===== ESTADO GLOBAL =====
let isAuthenticated = false;
let currentTab = "config-geral";
let editingCategoriaId = null;
let editingItemId = null;
let isDragging = false;
let dragItem = null;

// ===== DADOS DO SISTEMA =====
let sistemaConfig = {
    nome: "TRIBO BAR",
    whatsapp: "5551981894966"
};

let pixConfig = {
    chave: "43979611000136",
    nomeBeneficiario: "TRIBO BAR",
    cidade: "LAJEADO",
    usarCodigoTransferencia: true,
    prefixoCodigo: "TRB",
    codigoAtual: 1
};

let menuData = {
    Salgados: [
        { id: 1, nome: 'Pastel Res', preco: 13, desc: 'Molho, frango, cebola e mussarela', obs: false },
        { id: 2, nome: 'Pastel Frango', preco: 13, desc: 'Molho, frango, cebola e mussarela', obs: false }
    ],
    Doces: [
        { id: 3, nome: 'Mini Pizza Chocolate Preto', preco: 13, desc: 'Chocolate ao Leite', obs: false }
    ],
    Bebidas: [
        { id: 4, nome: 'Pitchulinha Fruki Guaraná 200ml', preco: 2.5, desc: 'Guaraná 200ml', obs: false }
    ]
};

// ===== FUNÇÕES DE LOGIN =====
function verificarLogin() {
    const senhaInput = document.getElementById('senhaAdmin');
    const senha = senhaInput.value;
    
    console.log("Senha digitada:", senha);
    console.log("Senha configurada:", ADMIN_PASSWORD);
    console.log("São iguais?", senha === ADMIN_PASSWORD);
    
    if (senha === ADMIN_PASSWORD) {
        isAuthenticated = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
        
        carregarDados();
        inicializarPainel();
        atualizarStatus();
        
        showNotification("success", "Login realizado com sucesso!");
        
        // Limpar campo de senha
        senhaInput.value = '';
    } else {
        showNotification("error", "Senha incorreta!");
        
        // Destacar campo com erro
        senhaInput.style.borderColor = '#ef4444';
        senhaInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        // Limpar após 2 segundos
        setTimeout(() => {
            senhaInput.style.borderColor = '';
            senhaInput.style.boxShadow = '';
        }, 2000);
        
        // Limpar campo e focar
        senhaInput.value = '';
        senhaInput.focus();
    }
}

function fazerLogout() {
    if (confirm("Deseja realmente sair do painel administrativo?")) {
        isAuthenticated = false;
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        
        // Focar no campo de senha
        document.getElementById('senhaAdmin').focus();
    }
}

// ===== INICIALIZAÇÃO DOS EVENTOS DE LOGIN =====
function inicializarEventosLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const inputSenha = document.getElementById('senhaAdmin');
    
    if (!btnLogin || !inputSenha) {
        console.error("Elementos de login não encontrados!");
        return;
    }
    
    console.log("Inicializando eventos de login...");
    
    // Evento de clique no botão
    btnLogin.addEventListener('click', verificarLogin);
    
    // Evento de Enter no campo de senha
    inputSenha.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            verificarLogin();
        }
    });
    
    // Evento para limpar estilos de erro ao digitar
    inputSenha.addEventListener('input', () => {
        inputSenha.style.borderColor = '';
        inputSenha.style.boxShadow = '';
    });
    
    console.log("Eventos de login inicializados com sucesso!");
}

// ===== FUNÇÕES DE NOTIFICAÇÃO =====
function showNotification(type, message) {
    const notifications = document.getElementById('notifications');
    
    if (!notifications) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success': icon = 'fa-check-circle'; break;
        case 'error': icon = 'fa-exclamation-circle'; break;
        case 'warning': icon = 'fa-exclamation-triangle'; break;
        case 'info': icon = 'fa-info-circle'; break;
    }
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="notification-content">
            <h4>${type === 'success' ? 'Sucesso!' : type === 'error' ? 'Erro!' : type === 'warning' ? 'Atenção!' : 'Informação'}</h4>
            <p>${message}</p>
        </div>
    `;
    
    notifications.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== FUNÇÕES DE STORAGE =====
function salvarDados() {
    try {
        console.log("💾 Salvando dados no localStorage...");
        
        // 1. Salvar MENU (sincronizado com sistema principal)
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuData));
        console.log("✅ Menu salvo:", Object.keys(menuData).length, "categorias");
        
        // 2. Salvar CONFIGURAÇÕES PIX (sincronizado com sistema principal)
        // Formatar igual ao sistema principal
        const pixDataParaSistema = {
            chave: pixConfig.chave,
            nomeBeneficiario: pixConfig.nomeBeneficiario,
            cidade: pixConfig.cidade,
            usarCodigoTransferencia: pixConfig.usarCodigoTransferencia,
            prefixoCodigo: pixConfig.prefixoCodigo,
            codigoAtual: pixConfig.codigoAtual,
            cnpjFormatado: pixConfig.chave.length === 14 ? 
                pixConfig.chave.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : ''
        };
        
        localStorage.setItem(STORAGE_KEYS.PIX, JSON.stringify(pixDataParaSistema));
        console.log("✅ Config PIX salva:", pixConfig.chave);
        
        // 3. Salvar CONFIGURAÇÕES DO SISTEMA (geral)
        localStorage.setItem(STORAGE_KEYS.SISTEMA, JSON.stringify(sistemaConfig));
        console.log("✅ Config sistema salva:", sistemaConfig.nome);
        
        // 4. Salvar código de transferência atual
        localStorage.setItem('codigo_transferencia_tribo', pixConfig.codigoAtual.toString());
        
        // 5. Forçar atualização do sistema principal
        // Adiciona um timestamp para forçar recarregamento
        const timestamp = Date.now().toString();
        localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp);
        
        // 6. Tentar atualizar sistema principal se estiver disponível
        try {
            if (typeof window.atualizarSistemaExterno === 'function') {
                window.atualizarSistemaExterno();
            }
            
            // Tentar atualizar iframe de preview
            const iframe = document.getElementById('previewFrame');
            if (iframe && iframe.contentWindow && typeof iframe.contentWindow.atualizarSistemaExterno === 'function') {
                iframe.contentWindow.atualizarSistemaExterno();
            }
        } catch (e) {
            console.log("ℹ️  Sistema principal não está disponível para atualização imediata");
        }
        
        showNotification("success", "Dados salvos com sucesso! O sistema principal será atualizado.");
        atualizarStatus();
        
        // Atualizar timestamp
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = 
                new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        }
        
        // Atualizar preview do sistema
        atualizarPreviewSistema();
            
    } catch (error) {
        console.error("❌ Erro ao salvar dados:", error);
        showNotification("error", "Erro ao salvar dados: " + error.message);
    }
}

function carregarDados() {
    try {
        console.log("📂 Carregando dados do localStorage...");
        
        // 1. Carregar MENU do sistema principal
        const menuStorage = localStorage.getItem(STORAGE_KEYS.MENU);
        if (menuStorage) {
            menuData = JSON.parse(menuStorage);
            console.log("✅ Menu carregado:", Object.keys(menuData).length, "categorias");
        } else {
            console.log("ℹ️  Usando menu padrão (nenhum menu salvo)");
        }
        
        // 2. Carregar CONFIGURAÇÕES PIX do sistema principal
        const pixStorage = localStorage.getItem(STORAGE_KEYS.PIX);
        if (pixStorage) {
            const pixData = JSON.parse(pixStorage);
            
            // Mapear para estrutura do admin
            pixConfig = {
                chave: pixData.chave || "43979611000136",
                nomeBeneficiario: pixData.nomeBeneficiario || "TRIBO BAR",
                cidade: pixData.cidade || "LAJEADO",
                usarCodigoTransferencia: pixData.usarCodigoTransferencia !== undefined ? 
                    pixData.usarCodigoTransferencia : true,
                prefixoCodigo: pixData.prefixoCodigo || "TRB",
                codigoAtual: pixData.codigoAtual || 1
            };
            
            console.log("✅ Config PIX carregada:", pixConfig.chave);
        } else {
            console.log("ℹ️  Usando configuração PIX padrão");
        }
        
        // 3. Carregar CONFIGURAÇÕES DO SISTEMA
        const sistemaStorage = localStorage.getItem(STORAGE_KEYS.SISTEMA);
        if (sistemaStorage) {
            sistemaConfig = JSON.parse(sistemaStorage);
            console.log("✅ Config sistema carregada:", sistemaConfig.nome);
        } else {
            console.log("ℹ️  Usando configuração sistema padrão");
        }
        
        // 4. Carregar CÓDIGO DE TRANSFERÊNCIA do sistema principal
        const codigoStorage = localStorage.getItem('codigo_transferencia_tribo');
        if (codigoStorage) {
            pixConfig.codigoAtual = parseInt(codigoStorage) || 1;
            console.log("✅ Código transferência carregado:", pixConfig.codigoAtual);
        }
        
    } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        showNotification("warning", "Erro ao carregar dados salvos. Usando configurações padrão.");
    }
}

// ===== FUNÇÃO PARA ATUALIZAR SISTEMA PRINCIPAL =====
function atualizarPreviewSistema() {
    // Atualizar preview no painel admin
    const nome = document.getElementById('sistemaNome')?.value || sistemaConfig.nome;
    const previewEl = document.getElementById('previewNomeSistema');
    if (previewEl) {
        previewEl.textContent = nome;
    }
    
    // Forçar atualização do iframe de preview
    const iframe = document.getElementById('previewFrame');
    if (iframe) {
        // Adiciona timestamp para evitar cache
        const timestamp = new Date().getTime();
        iframe.src = `index.html?refresh=${timestamp}`;
        
        // Adicionar listener para quando o iframe carregar
        iframe.onload = function() {
            console.log("✅ Preview iframe carregado");
            // Tentar atualizar o sistema dentro do iframe
            try {
                if (iframe.contentWindow && typeof iframe.contentWindow.atualizarSistemaExterno === 'function') {
                    setTimeout(() => {
                        iframe.contentWindow.atualizarSistemaExterno();
                    }, 1000);
                }
            } catch (e) {
                console.log("ℹ️  Não foi possível atualizar o sistema dentro do iframe");
            }
        };
    }
    
    // Mostrar mensagem de sincronização
    showNotification("info", "Sincronizando com sistema principal...");
}

// ===== FUNÇÃO PARA FORÇAR SINCRONIZAÇÃO =====
function sincronizarComSistemaPrincipal() {
    console.log("🔄 Sincronizando dados com sistema principal...");
    
    // 1. Atualizar menu no sistema principal
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuData));
    
    // 2. Atualizar configurações PIX no sistema principal
    const pixDataParaSistema = {
        chave: pixConfig.chave,
        nomeBeneficiario: pixConfig.nomeBeneficiario,
        cidade: pixConfig.cidade,
        usarCodigoTransferencia: pixConfig.usarCodigoTransferencia,
        prefixoCodigo: pixConfig.prefixoCodigo,
        codigoAtual: pixConfig.codigoAtual
    };
    
    localStorage.setItem(STORAGE_KEYS.PIX, JSON.stringify(pixDataParaSistema));
    
    // 3. Atualizar código de transferência
    localStorage.setItem('codigo_transferencia_tribo', pixConfig.codigoAtual.toString());
    
    // 4. Marcar como atualizado
    const timestamp = Date.now().toString();
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp);
    
    // 5. Tentar atualizar sistema principal
    try {
        if (typeof window.atualizarSistemaExterno === 'function') {
            window.atualizarSistemaExterno();
        }
    } catch (e) {
        console.log("ℹ️  Sistema principal não disponível");
    }
    
    showNotification("success", "Dados sincronizados com sucesso!");
    
    // Recarregar iframe de preview
    const iframe = document.getElementById('previewFrame');
    if (iframe) {
        const currentSrc = iframe.src.split('?')[0];
        iframe.src = currentSrc + '?refresh=' + Date.now();
    }
    
    atualizarStatus();
}

// ===== IDENTIFICAÇÃO DE CHAVE PIX =====
function identificarTipoChavePIX(chave) {
    const chaveLimpa = chave.replace(/\s+/g, '');
    
    if (/^\d{11}$/.test(chaveLimpa)) {
        const cpfFormatado = chaveLimpa.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        return {
            tipo: "CPF",
            chaveFormatada: cpfFormatado,
            valida: true
        };
    }
    
    if (/^\d{14}$/.test(chaveLimpa)) {
        const cnpjFormatado = chaveLimpa.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        return {
            tipo: "CNPJ",
            chaveFormatada: cnpjFormatado,
            valida: true
        };
    }
    
    const regexTelefone = /^(?:\+55)?(\d{10,11})$/;
    const matchTelefone = chaveLimpa.match(regexTelefone);
    if (matchTelefone) {
        const numero = matchTelefone[1];
        const ddd = numero.substring(0, 2);
        const resto = numero.substring(2);
        const telefoneFormatado = `(${ddd}) ${resto.length === 8 ? resto.replace(/(\d{4})(\d{4})/, '$1-$2') : resto.replace(/(\d{5})(\d{4})/, '$1-$2')}`;
        
        return {
            tipo: "Telefone",
            chaveFormatada: telefoneFormatado,
            valida: true
        };
    }
    
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regexEmail.test(chaveLimpa)) {
        return {
            tipo: "Email",
            chaveFormatada: chaveLimpa.toLowerCase(),
            valida: true
        };
    }
    
    const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (regexUUID.test(chaveLimpa)) {
        return {
            tipo: "Chave Aleatória",
            chaveFormatada: chaveLimpa.toLowerCase(),
            valida: true
        };
    }
    
    return {
        tipo: "Desconhecido",
        chaveFormatada: chave,
        valida: false
    };
}

// ===== FUNÇÕES DE STATUS =====
function atualizarStatus() {
    // Contar total de itens
    let totalItens = 0;
    Object.values(menuData).forEach(categoria => {
        totalItens += categoria.length;
    });
    
    // Contar categorias
    const totalCategorias = Object.keys(menuData).length;
    
    // Atualizar display
    document.getElementById('totalItems').textContent = totalItens;
    document.getElementById('totalCategories').textContent = totalCategorias;
    document.getElementById('categoriasCount').textContent = `${totalCategorias} categorias`;
}

// ===== INICIALIZAÇÃO DO PAINEL =====
function inicializarPainel() {
    // Carregar dados nos formulários
    carregarConfiguracoesGerais();
    carregarConfiguracoesPIX();
    carregarCategorias();
    carregarSelectsCategorias();
    carregarItens();
    
    // Configurar eventos
    configurarEventos();
    configurarDragAndDrop();
    
    // Atualizar preview inicial
    atualizarPreviewGeral();
}

function carregarConfiguracoesGerais() {
    const sistemaNomeEl = document.getElementById('sistemaNome');
    const whatsappNumeroEl = document.getElementById('whatsappNumero');
    
    if (sistemaNomeEl) sistemaNomeEl.value = sistemaConfig.nome;
    if (whatsappNumeroEl) whatsappNumeroEl.value = sistemaConfig.whatsapp;
}

function carregarConfiguracoesPIX() {
    const pixChaveEl = document.getElementById('pixChave');
    const pixNomeBeneficiarioEl = document.getElementById('pixNomeBeneficiario');
    const pixCidadeEl = document.getElementById('pixCidade');
    const pixUsarCodigoEl = document.getElementById('pixUsarCodigo');
    const pixPrefixoEl = document.getElementById('pixPrefixo');
    const pixProximoCodigoEl = document.getElementById('pixProximoCodigo');
    
    if (pixChaveEl) pixChaveEl.value = pixConfig.chave;
    if (pixNomeBeneficiarioEl) pixNomeBeneficiarioEl.value = pixConfig.nomeBeneficiario;
    if (pixCidadeEl) pixCidadeEl.value = pixConfig.cidade;
    if (pixUsarCodigoEl) pixUsarCodigoEl.checked = pixConfig.usarCodigoTransferencia;
    if (pixPrefixoEl) pixPrefixoEl.value = pixConfig.prefixoCodigo;
    if (pixProximoCodigoEl) pixProximoCodigoEl.value = pixConfig.codigoAtual;
    
    // Atualizar preview do tipo de chave
    atualizarInfoChavePIX();
    
    // Mostrar/ocultar configurações de código
    toggleCodigoConfig();
}

function atualizarInfoChavePIX() {
    const pixChaveEl = document.getElementById('pixChave');
    if (!pixChaveEl) return;
    
    const chave = pixChaveEl.value;
    const info = identificarTipoChavePIX(chave);
    
    const infoEl = document.getElementById('pixTipoInfo');
    if (infoEl) {
        if (info.valida) {
            infoEl.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981"></i> Tipo: ${info.tipo} (${info.chaveFormatada})`;
        } else {
            infoEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #f59e0b"></i> Tipo: ${info.tipo} - Chave pode ser inválida`;
        }
    }
}

function toggleCodigoConfig() {
    const pixUsarCodigoEl = document.getElementById('pixUsarCodigo');
    const configDiv = document.getElementById('codigoConfig');
    
    if (!pixUsarCodigoEl || !configDiv) return;
    
    const usarCodigo = pixUsarCodigoEl.checked;
    
    if (usarCodigo) {
        configDiv.style.display = 'block';
        atualizarPreviewCodigo();
    } else {
        configDiv.style.display = 'none';
    }
}

function atualizarPreviewCodigo() {
    const pixPrefixoEl = document.getElementById('pixPrefixo');
    const pixProximoCodigoEl = document.getElementById('pixProximoCodigo');
    const proximoCodigoPreviewEl = document.getElementById('proximoCodigoPreview');
    
    if (!pixPrefixoEl || !pixProximoCodigoEl || !proximoCodigoPreviewEl) return;
    
    const prefixo = pixPrefixoEl.value || 'TRB';
    const numero = pixProximoCodigoEl.value || 1;
    
    const codigo = `${prefixo}${numero.toString().padStart(3, '0')}`;
    proximoCodigoPreviewEl.textContent = codigo;
}

// ===== GERENCIAMENTO DE CATEGORIAS =====
function carregarCategorias() {
    const lista = document.getElementById('categoriasList');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    const categorias = Object.keys(menuData);
    
    if (categorias.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags fa-2x"></i>
                <p>Nenhuma categoria cadastrada</p>
                <p class="empty-hint">Adicione sua primeira categoria usando o formulário ao lado</p>
            </div>
        `;
        return;
    }
    
    categorias.forEach((categoria, index) => {
        const item = document.createElement('div');
        item.className = 'sortable-item';
        item.draggable = true;
        item.dataset.categoria = categoria;
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="categoria-info">
                <strong>${categoria}</strong>
                <span class="item-count">${menuData[categoria].length} itens</span>
            </div>
            <div class="item-actions">
                <button class="btn-icon btn-edit-categoria" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete-categoria" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        lista.appendChild(item);
    });
    
    // Adicionar eventos
    document.querySelectorAll('.btn-edit-categoria').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.sortable-item');
            editarCategoria(item.dataset.categoria);
        });
    });
    
    document.querySelectorAll('.btn-delete-categoria').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.sortable-item');
            excluirCategoria(item.dataset.categoria);
        });
    });
}

function adicionarCategoria() {
    const categoriaNomeEl = document.getElementById('categoriaNome');
    if (!categoriaNomeEl) return;
    
    const nome = categoriaNomeEl.value.trim();
    
    if (!nome) {
        showNotification("error", "Digite um nome para a categoria");
        return;
    }
    
    if (menuData[nome]) {
        showNotification("error", "Já existe uma categoria com este nome");
        return;
    }
    
    // Adicionar nova categoria
    menuData[nome] = [];
    
    // Salvar e atualizar
    salvarDados();
    carregarCategorias();
    carregarSelectsCategorias();
    
    // Limpar formulário
    categoriaNomeEl.value = '';
    
    showNotification("success", `Categoria "${nome}" adicionada com sucesso!`);
}

function editarCategoria(nomeAtual) {
    const categoriaNomeEl = document.getElementById('categoriaNome');
    if (!categoriaNomeEl) return;
    
    editingCategoriaId = nomeAtual;
    
    // Preencher formulário
    categoriaNomeEl.value = nomeAtual;
    
    // Mostrar botões de edição
    const btnAddCategoria = document.getElementById('btnAddCategoria');
    const btnUpdateCategoria = document.getElementById('btnUpdateCategoria');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    
    if (btnAddCategoria) btnAddCategoria.style.display = 'none';
    if (btnUpdateCategoria) btnUpdateCategoria.style.display = 'inline-flex';
    if (btnCancelEdit) btnCancelEdit.style.display = 'inline-flex';
    
    categoriaNomeEl.focus();
}

function atualizarCategoria() {
    const categoriaNomeEl = document.getElementById('categoriaNome');
    if (!categoriaNomeEl) return;
    
    const novoNome = categoriaNomeEl.value.trim();
    
    if (!novoNome) {
        showNotification("error", "Digite um nome para a categoria");
        return;
    }
    
    if (novoNome !== editingCategoriaId && menuData[novoNome]) {
        showNotification("error", "Já existe uma categoria com este nome");
        return;
    }
    
    // Renomear categoria (se necessário)
    if (novoNome !== editingCategoriaId) {
        menuData[novoNome] = menuData[editingCategoriaId];
        delete menuData[editingCategoriaId];
    }
    
    // Salvar e atualizar
    salvarDados();
    carregarCategorias();
    carregarSelectsCategorias();
    
    // Resetar formulário
    cancelarEdicaoCategoria();
    
    showNotification("success", `Categoria atualizada para "${novoNome}"!`);
}

function excluirCategoria(nome) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${nome}"?\n\nEsta ação irá excluir TODOS os ${menuData[nome].length} itens dentro desta categoria e não pode ser desfeita.`)) {
        return;
    }
    
    delete menuData[nome];
    
    // Salvar e atualizar
    salvarDados();
    carregarCategorias();
    carregarSelectsCategorias();
    
    showNotification("warning", `Categoria "${nome}" excluída com sucesso!`);
}

function cancelarEdicaoCategoria() {
    const categoriaNomeEl = document.getElementById('categoriaNome');
    const btnAddCategoria = document.getElementById('btnAddCategoria');
    const btnUpdateCategoria = document.getElementById('btnUpdateCategoria');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    
    editingCategoriaId = null;
    
    if (categoriaNomeEl) categoriaNomeEl.value = '';
    
    // Mostrar botão original
    if (btnAddCategoria) btnAddCategoria.style.display = 'inline-flex';
    if (btnUpdateCategoria) btnUpdateCategoria.style.display = 'none';
    if (btnCancelEdit) btnCancelEdit.style.display = 'none';
}

// ===== GERENCIAMENTO DE ITENS =====
function carregarSelectsCategorias() {
    const selects = [
        'itemCategoria',
        'filterCategoria',
        'ajusteCategoria'
    ];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Salvar valor atual
        const currentValue = select.value;
        
        // Limpar opções (exceto a primeira)
        select.innerHTML = '<option value="">Todas as categorias</option>';
        
        // Adicionar categorias
        Object.keys(menuData).forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            select.appendChild(option);
        });
        
        // Restaurar valor selecionado
        select.value = currentValue;
    });
}

function carregarItens() {
    const container = document.getElementById('itensList');
    if (!container) return;
    
    const filterCategoriaEl = document.getElementById('filterCategoria');
    const filterItemEl = document.getElementById('filterItem');
    
    const categoriaFiltro = filterCategoriaEl ? filterCategoriaEl.value : '';
    const textoFiltro = filterItemEl ? filterItemEl.value.toLowerCase() : '';
    
    // Filtrar itens
    const itensFiltrados = [];
    Object.entries(menuData).forEach(([categoria, itens]) => {
        if (categoriaFiltro && categoriaFiltro !== categoria) return;
        
        itens.forEach(item => {
            if (textoFiltro && !item.nome.toLowerCase().includes(textoFiltro)) return;
            
            itensFiltrados.push({
                ...item,
                categoria
            });
        });
    });
    
    // Exibir
    if (itensFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-hamburger fa-2x"></i>
                <p>Nenhum item encontrado</p>
                <p class="empty-hint">${categoriaFiltro || textoFiltro ? 'Tente alterar os filtros' : 'Adicione seu primeiro item clicando em "Novo Item"'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    itensFiltrados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.id = item.id;
        
        card.innerHTML = `
            <div class="item-card-header">
                <h4>${item.nome}</h4>
                <span class="item-price">R$ ${item.preco.toFixed(2)}</span>
            </div>
            <p class="item-desc">${item.desc || 'Sem descrição'}</p>
            <div class="item-footer">
                <span class="item-category">${item.categoria}</span>
                ${item.obs ? 
                    '<span class="item-obs"><i class="fas fa-comment"></i> Com observação</span>' : 
                    '<span class="item-obs"><i class="fas fa-comment-slash"></i> Sem observação</span>'
                }
            </div>
            <div class="item-actions-absolute">
                <button class="btn-icon btn-edit-item" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete-item" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Adicionar eventos
    document.querySelectorAll('.btn-edit-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.item-card');
            abrirModalItem(card.dataset.id);
        });
    });
    
    document.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.item-card');
            excluirItem(card.dataset.id);
        });
    });
}

function abrirModalItem(itemId = null) {
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !modalTitle) return;
    
    if (itemId) {
        // Modo edição
        editingItemId = parseInt(itemId);
        const item = encontrarItemPorId(itemId);
        
        if (!item) {
            showNotification("error", "Item não encontrado");
            return;
        }
        
        modalTitle.textContent = "Editar Item";
        document.getElementById('itemNome').value = item.nome;
        document.getElementById('itemPreco').value = item.preco;
        document.getElementById('itemCategoria').value = item.categoria;
        document.getElementById('itemDescricao').value = item.desc || '';
        document.getElementById('itemPermiteObs').checked = item.obs;
        
        const btnDeleteItem = document.getElementById('btnDeleteItem');
        if (btnDeleteItem) btnDeleteItem.style.display = 'inline-flex';
    } else {
        // Modo novo
        editingItemId = null;
        modalTitle.textContent = "Novo Item";
        
        document.getElementById('itemNome').value = '';
        document.getElementById('itemPreco').value = '';
        document.getElementById('itemCategoria').value = '';
        document.getElementById('itemDescricao').value = '';
        document.getElementById('itemPermiteObs').checked = false;
        
        const btnDeleteItem = document.getElementById('btnDeleteItem');
        if (btnDeleteItem) btnDeleteItem.style.display = 'none';
    }
    
    // Atualizar preview
    atualizarPreviewItem();
    
    // Mostrar modal
    modal.style.display = 'flex';
}

function encontrarItemPorId(id) {
    id = parseInt(id);
    
    for (const [categoria, itens] of Object.entries(menuData)) {
        const item = itens.find(i => i.id === id);
        if (item) {
            return { ...item, categoria };
        }
    }
    
    return null;
}

function salvarItem() {
    const itemNomeEl = document.getElementById('itemNome');
    const itemPrecoEl = document.getElementById('itemPreco');
    const itemCategoriaEl = document.getElementById('itemCategoria');
    const itemDescricaoEl = document.getElementById('itemDescricao');
    const itemPermiteObsEl = document.getElementById('itemPermiteObs');
    
    if (!itemNomeEl || !itemPrecoEl || !itemCategoriaEl || !itemDescricaoEl || !itemPermiteObsEl) {
        return;
    }
    
    const nome = itemNomeEl.value.trim();
    const preco = parseFloat(itemPrecoEl.value);
    const categoria = itemCategoriaEl.value;
    const descricao = itemDescricaoEl.value.trim();
    const permiteObs = itemPermiteObsEl.checked;
    
    // Validações
    if (!nome) {
        showNotification("error", "Digite um nome para o item");
        return;
    }
    
    if (!preco || preco <= 0) {
        showNotification("error", "Digite um preço válido");
        return;
    }
    
    if (!categoria) {
        showNotification("error", "Selecione uma categoria");
        return;
    }
    
    if (!menuData[categoria]) {
        showNotification("error", "Categoria não existe");
        return;
    }
    
    if (editingItemId) {
        // Atualizar item existente
        let itemEncontrado = false;
        
        for (const [cat, itens] of Object.entries(menuData)) {
            const index = itens.findIndex(i => i.id === editingItemId);
            if (index !== -1) {
                // Remover da categoria antiga se mudou de categoria
                if (cat !== categoria) {
                    itens.splice(index, 1);
                    menuData[categoria].push({
                        id: editingItemId,
                        nome,
                        preco,
                        desc: descricao,
                        obs: permiteObs
                    });
                } else {
                    // Atualizar na mesma categoria
                    itens[index] = {
                        id: editingItemId,
                        nome,
                        preco,
                        desc: descricao,
                        obs: permiteObs
                    };
                }
                
                itemEncontrado = true;
                break;
            }
        }
        
        if (!itemEncontrado) {
            showNotification("error", "Item não encontrado para atualização");
            return;
        }
        
        showNotification("success", `Item "${nome}" atualizado com sucesso!`);
    } else {
        // Adicionar novo item
        const novoId = gerarNovoIdItem();
        
        menuData[categoria].push({
            id: novoId,
            nome,
            preco,
            desc: descricao,
            obs: permiteObs
        });
        
        showNotification("success", `Item "${nome}" adicionado com sucesso!`);
    }
    
    // Salvar e atualizar
    salvarDados();
    carregarItens();
    atualizarStatus();
    
    // Fechar modal
    fecharModalItem();
}

function excluirItem(id) {
    id = parseInt(id);
    let itemNome = '';
    let categoria = '';
    
    // Encontrar item
    for (const [cat, itens] of Object.entries(menuData)) {
        const index = itens.findIndex(i => i.id === id);
        if (index !== -1) {
            itemNome = itens[index].nome;
            categoria = cat;
            break;
        }
    }
    
    if (!itemNome) {
        showNotification("error", "Item não encontrado");
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o item "${itemNome}"?`)) {
        return;
    }
    
    // Remover item
    menuData[categoria] = menuData[categoria].filter(item => item.id !== id);
    
    // Salvar e atualizar
    salvarDados();
    carregarItens();
    atualizarStatus();
    
    // Fechar modal se estiver aberto
    fecharModalItem();
    
    showNotification("warning", `Item "${itemNome}" excluído com sucesso!`);
}

function gerarNovoIdItem() {
    let maxId = 0;
    
    Object.values(menuData).forEach(itens => {
        itens.forEach(item => {
            if (item.id > maxId) {
                maxId = item.id;
            }
        });
    });
    
    return maxId + 1;
}

function atualizarPreviewItem() {
    const itemNomeEl = document.getElementById('itemNome');
    const itemPrecoEl = document.getElementById('itemPreco');
    const itemDescricaoEl = document.getElementById('itemDescricao');
    const itemCategoriaEl = document.getElementById('itemCategoria');
    const itemPermiteObsEl = document.getElementById('itemPermiteObs');
    
    if (!itemNomeEl || !itemPrecoEl || !itemDescricaoEl || !itemCategoriaEl || !itemPermiteObsEl) {
        return;
    }
    
    const nome = itemNomeEl.value || 'Nome do Item';
    const preco = itemPrecoEl.value || '0.00';
    const descricao = itemDescricaoEl.value || 'Descrição aparecerá aqui';
    const categoria = itemCategoriaEl.value || 'Categoria';
    const permiteObs = itemPermiteObsEl.checked;
    
    const previewNomeEl = document.getElementById('previewNome');
    const previewPrecoEl = document.getElementById('previewPreco');
    const previewDescEl = document.getElementById('previewDesc');
    const previewCategoriaEl = document.getElementById('previewCategoria');
    const previewObsStatusEl = document.getElementById('previewObsStatus');
    
    if (previewNomeEl) previewNomeEl.textContent = nome;
    if (previewPrecoEl) previewPrecoEl.textContent = `R$ ${parseFloat(preco).toFixed(2)}`;
    if (previewDescEl) previewDescEl.textContent = descricao;
    if (previewCategoriaEl) previewCategoriaEl.textContent = categoria;
    if (previewObsStatusEl) {
        previewObsStatusEl.textContent = permiteObs ? 'Com observação' : 'Sem observação';
        previewObsStatusEl.style.color = permiteObs ? '#f59e0b' : '#94a3b8';
    }
}

function fecharModalItem() {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingItemId = null;
}

// ===== ALTERAÇÃO DE PREÇOS EM LOTE =====
function previewAlteracaoPrecos() {
    const tipoRadio = document.querySelector('input[name="ajusteTipo"]:checked');
    const ajusteValorEl = document.getElementById('ajusteValor');
    const ajusteCategoriaEl = document.getElementById('ajusteCategoria');
    
    if (!tipoRadio || !ajusteValorEl || !ajusteCategoriaEl) return;
    
    const tipo = tipoRadio.value;
    const valor = parseFloat(ajusteValorEl.value);
    const categoria = ajusteCategoriaEl.value;
    
    if (!valor && tipo !== 'definir') {
        showNotification("error", "Digite um valor para o ajuste");
        return;
    }
    
    // Coletar itens afetados
    const itensAfetados = [];
    let totalAjuste = 0;
    
    Object.entries(menuData).forEach(([cat, itens]) => {
        if (categoria && categoria !== cat) return;
        
        itens.forEach(item => {
            let novoPreco = item.preco;
            
            switch(tipo) {
                case 'percentual':
                    novoPreco = item.preco * (1 + valor/100);
                    break;
                case 'valor':
                    novoPreco = item.preco + valor;
                    break;
                case 'definir':
                    novoPreco = valor;
                    break;
            }
            
            // Garantir preço mínimo
            if (novoPreco < 0) novoPreco = 0;
            
            itensAfetados.push({
                ...item,
                categoria: cat,
                novoPreco: parseFloat(novoPreco.toFixed(2))
            });
            
            totalAjuste += Math.abs(novoPreco - item.preco);
        });
    });
    
    // Exibir preview
    const previewDiv = document.getElementById('ajustePreview');
    if (!previewDiv) return;
    
    if (itensAfetados.length === 0) {
        previewDiv.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-search-dollar fa-2x"></i>
                <p>Nenhum item será afetado</p>
                <p class="empty-hint">Verifique os filtros selecionados</p>
            </div>
        `;
        
        const btnAplicarAjuste = document.getElementById('btnAplicarAjuste');
        if (btnAplicarAjuste) btnAplicarAjuste.style.display = 'none';
        return;
    }
    
    let html = '';
    itensAfetados.forEach(item => {
        const diferenca = item.novoPreco - item.preco;
        const sinal = diferenca >= 0 ? '+' : '';
        
        html += `
            <div class="preview-item">
                <div>
                    <strong>${item.nome}</strong>
                    <div style="font-size: 12px; color: #64748b;">${item.categoria}</div>
                </div>
                <div class="price-change">
                    <span class="old-price">R$ ${item.preco.toFixed(2)}</span>
                    <i class="fas fa-arrow-right" style="color: #94a3b8;"></i>
                    <span class="new-price">R$ ${item.novoPreco.toFixed(2)}</span>
                    <span style="color: ${diferenca >= 0 ? '#10b981' : '#ef4444'}; font-size: 12px;">
                        (${sinal}${diferenca.toFixed(2)})
                    </span>
                </div>
            </div>
        `;
    });
    
    previewDiv.innerHTML = html;
    
    // Atualizar resumo
    const totalAfetadosEl = document.getElementById('totalAfetados');
    const totalAjustadoEl = document.getElementById('totalAjustado');
    
    if (totalAfetadosEl) totalAfetadosEl.textContent = itensAfetados.length;
    if (totalAjustadoEl) totalAjustadoEl.textContent = `R$ ${totalAjuste.toFixed(2)}`;
    
    // Mostrar botão aplicar
    const btnAplicarAjuste = document.getElementById('btnAplicarAjuste');
    if (btnAplicarAjuste) btnAplicarAjuste.style.display = 'inline-flex';
    
    // Armazenar dados para aplicação
    window.previewAjusteData = {
        itensAfetados,
        tipo,
        valor,
        categoria
    };
}

function aplicarAlteracaoPrecos() {
    if (!window.previewAjusteData) {
        showNotification("error", "Nenhuma alteração para aplicar");
        return;
    }
    
    const { itensAfetados } = window.previewAjusteData;
    
    // Aplicar alterações
    itensAfetados.forEach(itemAfetado => {
        for (const [cat, itens] of Object.entries(menuData)) {
            const index = itens.findIndex(i => i.id === itemAfetado.id);
            if (index !== -1) {
                itens[index].preco = itemAfetado.novoPreco;
                break;
            }
        }
    });
    
    // Salvar e atualizar
    salvarDados();
    carregarItens();
    atualizarStatus();
    
    // Resetar preview
    const previewDiv = document.getElementById('ajustePreview');
    const totalAfetadosEl = document.getElementById('totalAfetados');
    const totalAjustadoEl = document.getElementById('totalAjustado');
    const btnAplicarAjuste = document.getElementById('btnAplicarAjuste');
    
    if (previewDiv) {
        previewDiv.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-check-circle fa-2x" style="color: #10b981"></i>
                <p>Alterações aplicadas com sucesso!</p>
            </div>
        `;
    }
    
    if (totalAfetadosEl) totalAfetadosEl.textContent = '0';
    if (totalAjustadoEl) totalAjustadoEl.textContent = 'R$ 0.00';
    if (btnAplicarAjuste) btnAplicarAjuste.style.display = 'none';
    
    window.previewAjusteData = null;
    
    showNotification("success", `Preços de ${itensAfetados.length} itens atualizados!`);
}

// ===== BACKUP E RESTAURAÇÃO =====
function exportarDados(formato) {
    const backupNomeEl = document.getElementById('backupNome');
    const nome = backupNomeEl ? backupNomeEl.value || 
                 `Backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}` : 
                 `Backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`;
    
    const dados = {
        sistema: sistemaConfig,
        pix: pixConfig,
        menu: menuData,
        metadata: {
            exportadoEm: new Date().toISOString(),
            versao: '1.0',
            totalItens: Object.values(menuData).reduce((acc, itens) => acc + itens.length, 0),
            totalCategorias: Object.keys(menuData).length
        }
    };
    
    let conteudo, extensao, tipoMIME;
    
    if (formato === 'json') {
        conteudo = JSON.stringify(dados, null, 2);
        extensao = 'json';
        tipoMIME = 'application/json';
    } else {
        conteudo = `=== BACKUP SISTEMA TRIBO BAR ===\n`;
        conteudo += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
        conteudo += `Total de categorias: ${dados.metadata.totalCategorias}\n`;
        conteudo += `Total de itens: ${dados.metadata.totalItens}\n\n`;
        
        conteudo += `=== CONFIGURAÇÕES GERAIS ===\n`;
        conteudo += `Nome: ${dados.sistema.nome}\n`;
        conteudo += `WhatsApp: ${dados.sistema.whatsapp}\n\n`;
        
        conteudo += `=== CONFIGURAÇÕES PIX ===\n`;
        conteudo += `Chave: ${dados.pix.chave}\n`;
        conteudo += `Beneficiário: ${dados.pix.nomeBeneficiario}\n\n`;
        
        conteudo += `=== CARDÁPIO ===\n`;
        Object.entries(dados.menu).forEach(([categoria, itens]) => {
            conteudo += `\n[${categoria}]\n`;
            itens.forEach(item => {
                conteudo += `- ${item.nome}: R$ ${item.preco.toFixed(2)}`;
                if (item.desc) conteudo += ` (${item.desc})`;
                conteudo += `\n`;
            });
        });
        
        extensao = 'txt';
        tipoMIME = 'text/plain';
    }
    
    // Criar e baixar arquivo
    const blob = new Blob([conteudo], { type: tipoMIME });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${nome}.${extensao}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Adicionar ao histórico
    adicionarBackupHistorico(nome, formato);
    
    showNotification("success", `Backup "${nome}" exportado com sucesso!`);
}

function adicionarBackupHistorico(nome, formato) {
    const historico = JSON.parse(localStorage.getItem(STORAGE_KEYS.BACKUP_HISTORY) || '[]');
    
    historico.unshift({
        nome,
        formato,
        data: new Date().toISOString(),
        tamanho: formato === 'json' ? 'JSON' : 'TXT'
    });
    
    // Manter apenas últimos 10 backups
    if (historico.length > 10) historico.pop();
    
    localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(historico));
    
    carregarHistoricoBackups();
}

function carregarHistoricoBackups() {
    const historico = JSON.parse(localStorage.getItem(STORAGE_KEYS.BACKUP_HISTORY) || '[]');
    const lista = document.getElementById('backupList');
    
    if (!lista) return;
    
    if (historico.length === 0) {
        lista.innerHTML = '<div class="empty-state">Nenhum backup encontrado</div>';
        return;
    }
    
    lista.innerHTML = '';
    
    historico.forEach(backup => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const data = new Date(backup.data);
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <strong>${backup.nome}</strong>
                    <div style="font-size: 11px; color: #64748b;">
                        ${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                <span style="background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                    ${backup.formato.toUpperCase()}
                </span>
            </div>
        `;
        
        lista.appendChild(item);
    });
}

// ===== DRAG AND DROP =====
function configurarDragAndDrop() {
    const lista = document.getElementById('categoriasList');
    
    if (!lista) return;
    
    // Eventos de arrastar
    lista.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('sortable-item')) return;
        
        isDragging = true;
        dragItem = e.target;
        dragItem.classList.add('dragging');
        
        e.dataTransfer.setData('text/plain', dragItem.dataset.categoria);
        e.dataTransfer.effectAllowed = 'move';
    });
    
    lista.addEventListener('dragend', () => {
        if (!dragItem) return;
        
        isDragging = false;
        dragItem.classList.remove('dragging');
        dragItem = null;
        
        // Atualizar ordem no objeto menuData
        atualizarOrdemCategorias();
    });
    
    // Eventos de soltar
    lista.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = getDragAfterElement(lista, e.clientY);
        const draggable = document.querySelector('.dragging');
        
        if (!draggable) return;
        
        if (afterElement == null) {
            lista.appendChild(draggable);
        } else {
            lista.insertBefore(draggable, afterElement);
        }
    });
    
    lista.addEventListener('drop', (e) => {
        e.preventDefault();
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function atualizarOrdemCategorias() {
    const itens = Array.from(document.querySelectorAll('#categoriasList .sortable-item'));
    
    // Criar novo objeto com a ordem atual
    const novoMenuData = {};
    
    itens.forEach(item => {
        const categoria = item.dataset.categoria;
        novoMenuData[categoria] = menuData[categoria];
    });
    
    // Atualizar objeto principal
    menuData = novoMenuData;
    
    // Salvar
    salvarDados();
    showNotification("success", "Ordem das categorias atualizada!");
}

// ===== PREVIEW DO SISTEMA =====
function atualizarPreviewGeral() {
    // Atualizar preview do nome do sistema
    const sistemaNomeEl = document.getElementById('sistemaNome');
    const nome = sistemaNomeEl ? sistemaNomeEl.value : sistemaConfig.nome;
    
    const previewEl = document.getElementById('previewNomeSistema');
    if (previewEl) {
        previewEl.textContent = nome;
    }
    
    // Atualizar iframe
    const iframe = document.getElementById('previewFrame');
    if (iframe) {
        // Recarregar com timestamp para evitar cache
        const currentSrc = iframe.src.split('?')[0];
        iframe.src = currentSrc + '?refresh=' + Date.now();
    }
}

function alterarDevicePreview(device) {
    const iframe = document.getElementById('previewFrame');
    if (!iframe) return;
    
    // Atualizar botões
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.device === device) {
            btn.classList.add('active');
        }
    });
    
    // Atualizar iframe
    iframe.classList.remove('mobile-view', 'tablet-view', 'desktop-view');
    iframe.classList.add(`${device}-view`);
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function configurarEventos() {
    // Login
    const btnLogin = document.getElementById('btnLogin');
    const senhaAdmin = document.getElementById('senhaAdmin');
    
    if (btnLogin) btnLogin.addEventListener('click', verificarLogin);
    if (senhaAdmin) {
        senhaAdmin.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verificarLogin();
        });
    }
    
    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', fazerLogout);
    
    // Salvar tudo
    const btnSaveAll = document.getElementById('btnSaveAll');
    if (btnSaveAll) btnSaveAll.addEventListener('click', salvarDados);
    
    // Sincronizar
    const btnSincronizar = document.getElementById('btnSincronizar');
    if (btnSincronizar) btnSincronizar.addEventListener('click', sincronizarComSistemaPrincipal);
    
    // Navegação por abas
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const tab = item.dataset.tab;
            
            // Atualizar menu ativo
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar aba correspondente
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabElement = document.getElementById(tab);
            if (tabElement) {
                tabElement.classList.add('active');
            }
            currentTab = tab;
        });
    });
    
    // Configurações gerais
    const sistemaNomeEl = document.getElementById('sistemaNome');
    if (sistemaNomeEl) sistemaNomeEl.addEventListener('input', atualizarPreviewGeral);
    
    // Configurações PIX
    const pixChaveEl = document.getElementById('pixChave');
    if (pixChaveEl) pixChaveEl.addEventListener('input', atualizarInfoChavePIX);
    
    const pixUsarCodigoEl = document.getElementById('pixUsarCodigo');
    if (pixUsarCodigoEl) pixUsarCodigoEl.addEventListener('change', toggleCodigoConfig);
    
    const pixPrefixoEl = document.getElementById('pixPrefixo');
    if (pixPrefixoEl) pixPrefixoEl.addEventListener('input', atualizarPreviewCodigo);
    
    const pixProximoCodigoEl = document.getElementById('pixProximoCodigo');
    if (pixProximoCodigoEl) pixProximoCodigoEl.addEventListener('input', atualizarPreviewCodigo);
    
    const btnResetCodigo = document.getElementById('btnResetCodigo');
    if (btnResetCodigo) {
        btnResetCodigo.addEventListener('click', () => {
            if (confirm("Resetar o contador de códigos para 1?")) {
                const pixProximoCodigoEl = document.getElementById('pixProximoCodigo');
                if (pixProximoCodigoEl) {
                    pixProximoCodigoEl.value = 1;
                    atualizarPreviewCodigo();
                }
            }
        });
    }
    
    // Categorias
    const btnAddCategoria = document.getElementById('btnAddCategoria');
    if (btnAddCategoria) btnAddCategoria.addEventListener('click', adicionarCategoria);
    
    const btnUpdateCategoria = document.getElementById('btnUpdateCategoria');
    if (btnUpdateCategoria) btnUpdateCategoria.addEventListener('click', atualizarCategoria);
    
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    if (btnCancelEdit) btnCancelEdit.addEventListener('click', cancelarEdicaoCategoria);
    
    const categoriaNomeEl = document.getElementById('categoriaNome');
    if (categoriaNomeEl) {
        categoriaNomeEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (editingCategoriaId) {
                    atualizarCategoria();
                } else {
                    adicionarCategoria();
                }
            }
        });
    }
    
    // Itens
    const btnAddItem = document.getElementById('btnAddItem');
    if (btnAddItem) btnAddItem.addEventListener('click', () => abrirModalItem());
    
    const filterCategoriaEl = document.getElementById('filterCategoria');
    if (filterCategoriaEl) filterCategoriaEl.addEventListener('change', carregarItens);
    
    const filterItemEl = document.getElementById('filterItem');
    if (filterItemEl) filterItemEl.addEventListener('input', carregarItens);
    
    // Modal de item
    const btnSaveItem = document.getElementById('btnSaveItem');
    if (btnSaveItem) btnSaveItem.addEventListener('click', salvarItem);
    
    const btnDeleteItem = document.getElementById('btnDeleteItem');
    if (btnDeleteItem) {
        btnDeleteItem.addEventListener('click', () => {
            if (editingItemId) {
                excluirItem(editingItemId);
            }
        });
    }
    
    const btnCancelItem = document.getElementById('btnCancelItem');
    if (btnCancelItem) btnCancelItem.addEventListener('click', fecharModalItem);
    
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', fecharModalItem);
    
    // Eventos de preview do item
    ['itemNome', 'itemPreco', 'itemDescricao'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', atualizarPreviewItem);
        }
    });
    
    const itemCategoriaEl = document.getElementById('itemCategoria');
    if (itemCategoriaEl) itemCategoriaEl.addEventListener('change', atualizarPreviewItem);
    
    const itemPermiteObsEl = document.getElementById('itemPermiteObs');
    if (itemPermiteObsEl) itemPermiteObsEl.addEventListener('change', atualizarPreviewItem);
    
    // Preços em lote
    document.querySelectorAll('input[name="ajusteTipo"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const tipo = radio.value;
            const unidade = document.getElementById('ajusteUnidade');
            const descricao = document.getElementById('ajusteDescricao');
            
            if (!unidade || !descricao) return;
            
            switch(tipo) {
                case 'percentual':
                    unidade.textContent = '%';
                    descricao.textContent = 'Aumento/Redução percentual aplicado ao preço atual';
                    break;
                case 'valor':
                    unidade.textContent = 'R$';
                    descricao.textContent = 'Valor adicionado/subtraído do preço atual';
                    break;
                case 'definir':
                    unidade.textContent = 'R$';
                    descricao.textContent = 'Preço fixo definido para todos os itens';
                    break;
            }
        });
    });
    
    const btnPreviewAjuste = document.getElementById('btnPreviewAjuste');
    if (btnPreviewAjuste) btnPreviewAjuste.addEventListener('click', previewAlteracaoPrecos);
    
    const btnAplicarAjuste = document.getElementById('btnAplicarAjuste');
    if (btnAplicarAjuste) btnAplicarAjuste.addEventListener('click', aplicarAlteracaoPrecos);
    
    // Backup
    const btnExportJSON = document.getElementById('btnExportJSON');
    if (btnExportJSON) btnExportJSON.addEventListener('click', () => exportarDados('json'));
    
    const btnExportTXT = document.getElementById('btnExportTXT');
    if (btnExportTXT) btnExportTXT.addEventListener('click', () => exportarDados('txt'));
    
    // Preview
    const btnRefreshPreview = document.getElementById('btnRefreshPreview');
    if (btnRefreshPreview) {
        btnRefreshPreview.addEventListener('click', () => {
            const iframe = document.getElementById('previewFrame');
            if (iframe) {
                iframe.src = iframe.src;
            }
        });
    }
    
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alterarDevicePreview(btn.dataset.device);
        });
    });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("Documento carregado - Iniciando painel admin...");
    
    // Inicializar eventos de login PRIMEIRO
    inicializarEventosLogin();
    
    // Carregar histórico de backups
    carregarHistoricoBackups();
    
    // Configurar data/hora atual
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = 
            new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    }
    
    // Focar no campo de senha
    const senhaInput = document.getElementById('senhaAdmin');
    if (senhaInput) {
        senhaInput.focus();
    }
    
    console.log("Painel admin inicializado com sucesso!");
    console.log("Senha configurada:", ADMIN_PASSWORD);
});

// Exportar função para atualização do sistema principal
window.atualizarSistemaExterno = function() {
    console.log("🔄 Atualização solicitada externamente");
    // Recarregar dados do localStorage
    carregarDados();
    // Atualizar interface
    if (isAuthenticated) {
        carregarConfiguracoesGerais();
        carregarConfiguracoesPIX();
        carregarCategorias();
        carregarSelectsCategorias();
        carregarItens();
        atualizarStatus();
    }
};