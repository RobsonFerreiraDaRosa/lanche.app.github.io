// ===== CONFIGURAÇÕES DE SEGURANÇA =====
// A senha agora está no banco de dados Supabase
// Verifique o arquivo supabase.js para configuração

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

let menuData = {};

// ===== FUNÇÕES DE LOGIN =====
// ===== FUNÇÕES DE LOGIN (CORRIGIDA) =====
async function verificarLogin() {
    const senhaInput = document.getElementById('senhaAdmin');
    const senha = senhaInput.value.trim();
    
    if (!senha) {
        showNotification("error", "Digite a senha de administrador");
        return;
    }
    
    console.log("🔐 Verificando senha...");
    
    // Verificar senha no Supabase
    const resultado = await window.SupabaseDB?.verificarSenhaAdmin(senha);
    
    console.log("Resultado da verificação:", resultado);
    
    if (resultado?.sucesso) {
        isAuthenticated = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
        
        // Carregar dados do sistema
        await carregarDados();
        inicializarPainel();
        atualizarStatus();
        
        showNotification("success", resultado.mensagem || "Login realizado com sucesso!");
        
        // Limpar campo de senha
        senhaInput.value = '';
    } else {
        showNotification("error", resultado?.mensagem || "Senha incorreta!");
        
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

// ===== CAPTURAR VALORES ATUAIS DOS FORMULÁRIOS =====
function capturarValoresDosFormularios() {
    console.log("📝 Capturando valores dos formulários...");
    
    // Capturar Configurações Gerais
    const sistemaNomeEl = document.getElementById('sistemaNome');
    const whatsappNumeroEl = document.getElementById('whatsappNumero');
    
    if (sistemaNomeEl) {
        sistemaConfig.nome = sistemaNomeEl.value.trim() || "TRIBO BAR";
    }
    if (whatsappNumeroEl) {
        sistemaConfig.whatsapp = whatsappNumeroEl.value.trim() || "5551981894966";
    }
    
    // Capturar Configurações PIX
    const pixChaveEl = document.getElementById('pixChave');
    const pixNomeBeneficiarioEl = document.getElementById('pixNomeBeneficiario');
    const pixCidadeEl = document.getElementById('pixCidade');
    const pixUsarCodigoEl = document.getElementById('pixUsarCodigo');
    const pixPrefixoEl = document.getElementById('pixPrefixo');
    const pixProximoCodigoEl = document.getElementById('pixProximoCodigo');
    
    if (pixChaveEl) {
        pixConfig.chave = pixChaveEl.value.trim() || "43979611000136";
    }
    if (pixNomeBeneficiarioEl) {
        pixConfig.nomeBeneficiario = pixNomeBeneficiarioEl.value.trim() || "TRIBO BAR";
    }
    if (pixCidadeEl) {
        pixConfig.cidade = pixCidadeEl.value.trim() || "LAJEADO";
    }
    if (pixUsarCodigoEl) {
        pixConfig.usarCodigoTransferencia = pixUsarCodigoEl.checked;
    }
    if (pixPrefixoEl) {
        pixConfig.prefixoCodigo = pixPrefixoEl.value.trim() || "TRB";
    }
    if (pixProximoCodigoEl) {
        const valor = parseInt(pixProximoCodigoEl.value);
        pixConfig.codigoAtual = isNaN(valor) || valor < 1 ? 1 : valor;
    }
    
    console.log("✅ Valores capturados:", {
        sistema: sistemaConfig,
        pix: pixConfig
    });
}

// ===== FUNÇÕES DE STORAGE =====
async function salvarDados() {
    try {
        console.log("💾 Salvando dados no Supabase...");
        
        // PRIMEIRO: Capturar valores atuais dos formulários
        capturarValoresDosFormularios();
        
        // 1. Salvar configurações no Supabase
        const resultado = await window.SupabaseDB?.salvarConfiguracoesSistema(sistemaConfig, pixConfig);
        
        if (!resultado?.sucesso) {
            throw new Error(resultado?.mensagem || "Erro ao salvar configurações");
        }
        
        console.log("✅ Configurações salvas no Supabase");
        
        // 2. Atualizar interface
        recarregarDadosNosFormularios();
        
        showNotification("success", "Dados salvos com sucesso!");
        
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

async function carregarDados() {
    try {
        console.log("📂 Carregando dados do Supabase...");
        
        // 1. Carregar configurações do sistema
        const configs = await window.SupabaseDB?.carregarConfiguracoesSistema();
        
        if (configs?.sistema) {
            sistemaConfig = configs.sistema;
            console.log("✅ Config sistema carregada:", sistemaConfig.nome);
        } else {
            console.log("ℹ️  Usando configuração sistema padrão");
        }
        
        if (configs?.pix) {
            pixConfig = configs.pix;
            console.log("✅ Config PIX carregada:", pixConfig.chave);
        } else {
            console.log("ℹ️  Usando configuração PIX padrão");
        }
        
        // 2. Carregar menu do Supabase
        menuData = await window.SupabaseDB?.carregarCategorias() || {};
        console.log("✅ Menu carregado:", Object.keys(menuData).length, "categorias");
        
    } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        showNotification("warning", "Erro ao carregar dados salvos. Usando configurações padrão.");
    }
}

// ===== RECARREGAR DADOS NOS FORMULÁRIOS =====
function recarregarDadosNosFormularios() {
    console.log("🔄 Recarregando dados nos formulários...");
    
    // 1. Recarregar configurações gerais
    carregarConfiguracoesGerais();
    
    // 2. Recarregar configurações PIX
    carregarConfiguracoesPIX();
    
    // 3. Recarregar categorias
    carregarCategorias();
    carregarSelectsCategorias();
    
    // 4. Recarregar itens
    carregarItens();
    
    // 5. Atualizar status
    atualizarStatus();
    
    console.log("✅ Dados recarregados nos formulários");
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
    }
    
    // Mostrar mensagem de sincronização
    showNotification("info", "Dados atualizados com sucesso!");
}

// ===== FUNÇÃO PARA FORÇAR SINCRONIZAÇÃO =====
async function sincronizarComSistemaPrincipal() {
    console.log("🔄 Sincronizando dados...");
    
    // Recarregar dados do Supabase
    await carregarDados();
    
    // Recarregar interface
    recarregarDadosNosFormularios();
    
    showNotification("success", "Dados sincronizados com sucesso!");
    
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
async function carregarCategorias() {
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
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const item = btn.closest('.sortable-item');
            await excluirCategoria(item.dataset.categoria);
        });
    });
}

async function adicionarCategoria() {
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
    
    // Adicionar nova categoria no Supabase
    const resultado = await window.SupabaseDB?.salvarCategoria(nome);
    
    if (resultado?.sucesso) {
        // Atualizar localmente
        menuData[nome] = [];
        
        // Atualizar interface
        await carregarDados();
        carregarCategorias();
        carregarSelectsCategorias();
        
        // Limpar formulário
        categoriaNomeEl.value = '';
        
        showNotification("success", `Categoria "${nome}" adicionada com sucesso!`);
    } else {
        showNotification("error", resultado?.mensagem || "Erro ao adicionar categoria");
    }
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

async function atualizarCategoria() {
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
    
    // TODO: Implementar atualização no Supabase
    // Por enquanto, atualiza localmente
    if (novoNome !== editingCategoriaId) {
        menuData[novoNome] = menuData[editingCategoriaId];
        delete menuData[editingCategoriaId];
    }
    
    // Salvar e atualizar
    await salvarDados();
    await carregarDados();
    carregarCategorias();
    carregarSelectsCategorias();
    
    // Resetar formulário
    cancelarEdicaoCategoria();
    
    showNotification("success", `Categoria atualizada para "${novoNome}"!`);
}

async function excluirCategoria(nome) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${nome}"?\n\nEsta ação irá excluir TODOS os ${menuData[nome].length} itens dentro desta categoria e não pode ser desfeita.`)) {
        return;
    }
    
    // TODO: Implementar exclusão no Supabase
    // Por enquanto, exclui localmente
    delete menuData[nome];
    
    // Salvar e atualizar
    await salvarDados();
    await carregarDados();
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
                <span class="item-category">${categoria}</span>
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
        btn.addEventListener('click', async () => {
            const card = btn.closest('.item-card');
            await excluirItem(card.dataset.id);
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

async function salvarItem() {
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
    
    // Preparar item para salvar
    const item = {
        id: editingItemId,
        nome,
        preco,
        desc: descricao,
        obs: permiteObs,
        categoria
    };
    
    // Salvar no Supabase
    const resultado = await window.SupabaseDB?.salvarItem(item);
    
    if (resultado?.sucesso) {
        showNotification("success", resultado.mensagem);
        
        // Recarregar dados
        await carregarDados();
        carregarItens();
        atualizarStatus();
        
        // Fechar modal
        fecharModalItem();
    } else {
        showNotification("error", resultado?.mensagem || "Erro ao salvar item");
    }
}

async function excluirItem(id) {
    id = parseInt(id);
    let itemNome = '';
    let categoria = '';
    
    // Encontrar item localmente
    for (const [cat, itens] of Object.entries(menuData)) {
        const item = itens.find(i => i.id === id);
        if (item) {
            itemNome = item.nome;
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
    
    // Excluir no Supabase
    const resultado = await window.SupabaseDB?.excluirItem(id);
    
    if (resultado?.sucesso) {
        // Recarregar dados
        await carregarDados();
        carregarItens();
        atualizarStatus();
        
        // Fechar modal se estiver aberto
        fecharModalItem();
        
        showNotification("warning", `Item "${itemNome}" excluído com sucesso!`);
    } else {
        showNotification("error", resultado?.mensagem || "Erro ao excluir item");
    }
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
        
        // Atualizar ordem no Supabase
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

async function atualizarOrdemCategorias() {
    const itens = Array.from(document.querySelectorAll('#categoriasList .sortable-item'));
    const ordemCategorias = itens.map(item => item.dataset.categoria);
    
    // Atualizar no Supabase
    const resultado = await window.SupabaseDB?.atualizarOrdemCategorias(ordemCategorias);
    
    if (resultado?.sucesso) {
        showNotification("success", "Ordem das categorias atualizada!");
    } else {
        showNotification("error", resultado?.mensagem || "Erro ao atualizar ordem");
    }
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function configurarEventos() {
    // Ajustar padding do conteúdo para header fixo em mobile
    function ajustarPaddingParaHeader() {
        const adminContent = document.querySelector('.admin-content');
        const adminHeader = document.querySelector('.admin-header');
        
        if (adminContent && adminHeader && window.innerWidth <= 768) {
            const headerHeight = adminHeader.offsetHeight;
            adminContent.style.paddingTop = (headerHeight + 16) + 'px';
        }
    }
    
    // Executar ao carregar e ao redimensionar
    ajustarPaddingParaHeader();
    window.addEventListener('resize', ajustarPaddingParaHeader);
    
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
    
    // Menu mobile toggle
    const btnMenuToggle = document.getElementById('btnMenuToggle');
    if (btnMenuToggle) {
        btnMenuToggle.addEventListener('click', toggleMenuMobile);
    }
    
    // Fechar menu ao clicar em um item (em mobile)
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                closeMenuMobile();
            }
        });
    });
    
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
    
    // Configurações gerais - capturar mudanças em tempo real
    const sistemaNomeEl = document.getElementById('sistemaNome');
    const whatsappNumeroEl = document.getElementById('whatsappNumero');
    
    if (sistemaNomeEl) {
        sistemaNomeEl.addEventListener('input', () => {
            sistemaConfig.nome = sistemaNomeEl.value.trim() || "TRIBO BAR";
            atualizarPreviewGeral();
        });
    }
    
    if (whatsappNumeroEl) {
        whatsappNumeroEl.addEventListener('input', () => {
            sistemaConfig.whatsapp = whatsappNumeroEl.value.trim() || "5551981894966";
        });
    }
    
    // Configurações PIX - capturar mudanças em tempo real
    const pixChaveEl = document.getElementById('pixChave');
    const pixNomeBeneficiarioEl = document.getElementById('pixNomeBeneficiario');
    const pixCidadeEl = document.getElementById('pixCidade');
    const pixUsarCodigoEl = document.getElementById('pixUsarCodigo');
    const pixPrefixoEl = document.getElementById('pixPrefixo');
    const pixProximoCodigoEl = document.getElementById('pixProximoCodigo');
    
    if (pixChaveEl) {
        pixChaveEl.addEventListener('input', () => {
            pixConfig.chave = pixChaveEl.value.trim() || "43979611000136";
            atualizarInfoChavePIX();
        });
    }
    
    if (pixNomeBeneficiarioEl) {
        pixNomeBeneficiarioEl.addEventListener('input', () => {
            pixConfig.nomeBeneficiario = pixNomeBeneficiarioEl.value.trim() || "TRIBO BAR";
        });
    }
    
    if (pixCidadeEl) {
        pixCidadeEl.addEventListener('input', () => {
            pixConfig.cidade = pixCidadeEl.value.trim() || "LAJEADO";
        });
    }
    
    if (pixUsarCodigoEl) {
        pixUsarCodigoEl.addEventListener('change', () => {
            pixConfig.usarCodigoTransferencia = pixUsarCodigoEl.checked;
            toggleCodigoConfig();
        });
    }
    
    if (pixPrefixoEl) {
        pixPrefixoEl.addEventListener('input', () => {
            pixConfig.prefixoCodigo = pixPrefixoEl.value.trim() || "TRB";
            atualizarPreviewCodigo();
        });
    }
    
    if (pixProximoCodigoEl) {
        pixProximoCodigoEl.addEventListener('input', () => {
            const valor = parseInt(pixProximoCodigoEl.value);
            pixConfig.codigoAtual = isNaN(valor) || valor < 1 ? 1 : valor;
            atualizarPreviewCodigo();
        });
    }
    
    const btnResetCodigo = document.getElementById('btnResetCodigo');
    if (btnResetCodigo) {
        btnResetCodigo.addEventListener('click', () => {
            if (confirm("Resetar o contador de códigos para 1?")) {
                const pixProximoCodigoEl = document.getElementById('pixProximoCodigo');
                if (pixProximoCodigoEl) {
                    pixProximoCodigoEl.value = 1;
                    pixConfig.codigoAtual = 1;
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
    
    // Preview
    const btnRefreshPreview = document.getElementById('btnRefreshPreview');
    if (btnRefreshPreview) {
        btnRefreshPreview.addEventListener('click', () => {
            const iframe = document.getElementById('previewFrame');
            if (iframe) {
                const currentSrc = iframe.src.split('?')[0];
                iframe.src = currentSrc + '?refresh=' + Date.now();
            }
        });
    }
    
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alterarDevicePreview(btn.dataset.device);
        });
    });
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

// ===== CONTROLE DO MENU MOBILE =====
function toggleMenuMobile() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (!sidebar) return;
    
    sidebar.classList.toggle('active');
    
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

function closeMenuMobile() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Documento carregado - Iniciando painel admin...");
    
    // Inicializar Supabase
    const supabaseInicializado = await window.SupabaseDB?.inicializarSupabase();
    if (!supabaseInicializado) {
        console.warn("⚠️ Supabase não inicializado. Verifique a configuração.");
    }
    
    // Inicializar eventos de login
    inicializarEventosLogin();
    
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
    
    // Overlay para fechar menu
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMenuMobile);
    }
    
    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            closeMenuMobile();
        }
    });
    
    console.log("Painel admin inicializado com sucesso!");
});

